// .cspell.cjs
module.exports = {
  version: "0.2",
  import: ["@cspell/dict-en-au"],
  language: "en-au",
  words: [
    // project / tech terms
    "argon2",
    "argon2i",
    "zod",
    "stdext",
    "PasswordService",
    "hashConfig",
    "hashPassword",
    "verifyPassword",
    "safeParse",

    // common developer words
    "tsconfig",
    "eslint",
    "prettier",
    "vite",
    "webpack",
    "nodejs",
    "typescript",
    "tsx",
  ],
  ignorePaths: [
    "node_modules",
    "dist",
    "build",
    ".git",
    ".next",
    "out",
    "coverage",
    "public",
    "*.min.js",
  ],
  flagWords: ["TODO", "FIXME", "HACK"],
  ignoreRegExpList: [
    "/\\/\\/.*", // single-line comments
    "/\\/\\*[\\s\\S]*?\\*\\//", // block comments
    "\\b0x[0-9A-Fa-f]+\\b", // hex literals
    "\\bhttps?:\\/\\/\\S+\\b", // urls
  ],
  maxNumberOfProblems: 250,
};
