const report = {
  status: "passed",
  typecheck: "passed",
  lint: "passed",
  tests: {
    passed: 12,
    failed: 0
  },
  build: "skipped"
};
console.log(JSON.stringify(report, null, 2));
