import util from "util";
import readline from "readline";
import { updatePassword } from "../services/account";

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
    const email = await question("Email: ");

    rl.query = "Password : ";
    rl.stdoutMuted = true;

    const pwd = await question(rl.query);

    if (email && pwd) {
      await updatePassword(email, pwd);
      console.log("\nPassword updated");
    } else {
      console.log("\nMissing email or password");
    }
  } catch (e) {
    console.log(e);
  }

  process.exit(0);
})();
