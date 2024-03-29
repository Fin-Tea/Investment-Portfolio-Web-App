import util from "util";
import readline from "readline";
import { createAccount } from "../services/account";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl._writeToOutput = function _writeToOutput(stringToWrite) {
  if (rl.stdoutMuted)
    rl.output.write(
      "\x1B[2K\x1B[200D" +
        rl.query +
        "[" +
        (rl.line.length % 2 == 1 ? "=-" : "-=") +
        "]"
    );
  else rl.output.write(stringToWrite);
};

const question = util.promisify(rl.question).bind(rl);

(async function () {
  try {
    let firstName = await question("First Name: ");

    firstName = firstName.trim();

    let lastName = await question("Last Name: ");

    lastName = lastName.trim();

    let email = await question("Email: ");

    email = email.trim();

    rl.query = "Password : ";
    rl.stdoutMuted = true;

    let pwd = await question(rl.query);

    pwd = pwd.trim();

    rl.query = "Password Confirmation : ";

    let pwdConfirmation = await question(rl.query);

    pwdConfirmation = pwdConfirmation.trim();

    if (pwdConfirmation !== pwd) {
      throw new Error("Error: Password mismatch");
    }

    rl.query = "Account Name : ";
    rl.stdoutMuted = false;

    let accountName = await question(rl.query);

    accountName = accountName.trim();

    if (firstName && lastName && email && pwd && accountName) {
      const account = await createAccount(
        firstName,
        lastName,
        email,
        pwd,
        accountName
      );
      console.log("\nAccount created");
      console.log(JSON.stringify(account));
    } else {
      console.log(
        "\nMissing first name, last name, email, password or account name"
      );
    }
  } catch (e) {
    console.log(e);
  }

  process.exit(0);
})();
