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

export function generateAccessToken(account) {
  return jwt.sign(account, config.auth.jwtTokenSecret, {
    expiresIn: `${SECONDS_EXPIRES_IN}s`,
  });
}

export function authenticateToken(token) {
  if (!token) {
    return null;
  }

  try {
    const decodedToken = jwt.verify(token, config.auth.jwtTokenSecret);
    return decodedToken;
  } catch (e) {
    // TODO: Add refresh_token support. 'if e.name === 'TokenExpiredError' then try refresh'
    return null;
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
