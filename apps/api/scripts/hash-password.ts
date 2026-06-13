import bcrypt from "bcrypt";

const password = process.argv[2];

if (!password) {
  // eslint-disable-next-line no-console -- CLI usage message
  console.error("Usage: npm run hash-password -- <password>");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
// eslint-disable-next-line no-console -- CLI output
console.log(hash);
