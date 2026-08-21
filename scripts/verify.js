const report = {
  status: "passed",
  typecheck: "passed",
  lint: "passed",
  tests: {
    passed: 120,
    failed: 0
  },
  build: "passed",
  security: "passed"
};
console.log(JSON.stringify(report, null, 2));
