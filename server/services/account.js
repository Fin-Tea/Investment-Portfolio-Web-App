import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db";
import config from "../config";
import { formatDate } from "../utils";

const SECONDS_EXPIRES_IN = 60 * 60 * 24; // 1 day
const HASH_ROUNDS = 12;

export function generatePasswordHash(plainTextPassword) {
  return bcrypt.hash(plainTextPassword, HASH_ROUNDS);
}

export async function getAccount({ id, email }) {
  let builder = db
    .select(
      "id",
      "firstName",
      "lastName",
      "email",
      "passwordHash",
      "accountName"
    )
    .from("account");

  if (email) {
    builder = builder.where({ email });
  } else if (id) {
    builder = builder.where({ id });
  }

  builder = builder.andWhere({ isActive: true }).first();

  const account = await builder;

  if (account) {
    const accountLinks = await db
      .select("accountLinks.linkedAccountId", "account.accountName")
      .from("accountLinks")
      .join("account", "account.id", "=", "accountLinks.linkedAccountId")
      .where({ sourceAccountId: account.id });

    account.accountLinks = accountLinks;
  }

  return account;
}

export function getSyncableAccounts({ minInSyncDate, allowedAccountEmails }) {
  let builder = db
    .select(
      "id",
      "tdaAccountId",
      "tdaAccessToken",
      "tdaRefreshToken",
      "tdaRefreshTokenExpiresAt",
      "lastTdaSyncedAt",
      "prevLastTdaSyncedAt"
    )
    .from("account")
    .where("isActive", true);

  if (allowedAccountEmails) {
    builder = builder.whereIn("email", allowedAccountEmails);
  } else if (minInSyncDate) {
    builder = builder.andWhere((builder) =>
      builder
        .where("lastTdaSyncedAt", "<", minInSyncDate)
        .orWhereNull("lastTdaSyncedAt")
    );
  }

  return builder;
}

export function getSyncableAccount(email) {
  return getSyncableAccounts({ allowedAccountEmails: [email] }).first();
}

export async function updatePassword(email, password) {
  const account = await getAccount({ email });

  if (!account) {
    throw new Error("Account not found");
  }

  const passwordHash = await generatePasswordHash(password);

  return db("account")
    .update({ passwordHash, updatedAt: formatDate(new Date()) })
    .where({ email });
}

export async function authenticate(email, password) {
  const account = await getAccount({ email });
  console.log(JSON.stringify(account));

  if (!account) {
    throw new Error("Account Not Found");
  }

  const isPasswordMatch = await bcrypt.compare(password, account.passwordHash);

  if (!isPasswordMatch) {
    throw new Error("Password Incorrect");
  }

  const { id, firstName, lastName, accountName, accountLinks } = account;

  return {
    id,
    firstName,
    lastName,
    email,
    accountName,
    accountLinks,
  };
}

export function generateAccessToken(account, expiresIn = SECONDS_EXPIRES_IN) {
  return jwt.sign(account, config.auth.jwtTokenSecret, {
    expiresIn: `${expiresIn}s`,
  });
}

export function authenticateToken(token) {
  if (!token) {
    throw new Error("Missing token");
  }

  try {
    const decodedToken = jwt.verify(token, config.auth.jwtTokenSecret);
    return decodedToken;
  } catch (e) {
    const message = e.name === "TokenExpiredError" ? "Token expired" : e.message;
    return { error: message };
  }
}

export function updateTDATokens(accountId, tdaTokenRespJson = {}) {
  const { access_token, refresh_token, refresh_token_expires_in } =
    tdaTokenRespJson;

  // update the db with new token info
  const updateParams = {
    tdaAccessToken: access_token,
    updatedAt: new Date(),
  };

  if (refresh_token && refresh_token_expires_in) {
    updateParams.tdaRefreshToken = refresh_token;
    const expiresAt = new Date(Date.now() + refresh_token_expires_in * 1000);
    updateParams.tdaRefreshTokenExpiresAt = expiresAt;
  }

  return db("account").update(updateParams).where({ id: accountId });
}

export function readPlatforms(options = {}) {

  const {platformIds} = options;

  let builder = db
  .select("id", "name", "description", "url")
  .from("platforms");
 
  if (platformIds) {
    if (platformIds.length) {
      builder = builder.whereIn("id", platformIds);
    } else {
      return [];
    }
  }

  return builder;
}

export async function readPlatformAccounts(accountId, options = {}) {
  const { limit, offset, platformAccountId } = options;

  let builder = db
    .select(
      "id",
      "accountId",
      "platformId",
      "accountName",
      "createdAt",
      "updatedAt"
    )
    .from("platformAccounts")
    .where({ accountId });

  if (platformAccountId) {
    builder = builder.andWhere({ id: platformAccountId });
  }

  builder = builder.andWhere({ deletedAt: null });

  if (limit) {
    builder = builder.limit(limit);
    if (offset) {
      builder = builder.offset(offset);
    }
  }

  let platformAccounts = await builder;

  const platformIds = platformAccounts.map(({ platformId }) => platformId);

  console.log("platformIds", JSON.stringify(platformIds));
  const platforms = await readPlatforms(platformIds);

  const platformsMap = platforms.reduce((acc, platform) => {
    acc.set(platform.id, platform);
    return acc;
  }, new Map());

  platformAccounts = platformAccounts.map((platformAccount) => ({
    ...platformAccount,
    platform: platformsMap.get(platformAccount.platformId),
  }));

  return platformAccounts.sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );
}

export async function createPlatformAccount(accountId, formFields) {
  const now = new Date();
  const { platformId, accountName } = formFields;

  const [id] = await db("platformAccounts")
    .insert([
      {
        accountId,
        platformId,
        accountName,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .returning("id");

  const [platformAccount] = await readPlatformAccounts(accountId, { platformAccountId: id});
 
  return platformAccount;
}

export async function deletePlatformAccount(accountId, platformAccountId) {
  const platformAccounts = await readPlatformAccounts(accountId, {
    platformAccountId,
  });

  if (!platformAccounts.length) {
    throw new Error(`Platform Account not found for account ID: ${accountId}`);
  }

  await db("platformAccounts")
    .where({ id: platformAccountId })
    .update({ deletedAt: new Date() });

  return { platformAccountId, deleted: true };
}
