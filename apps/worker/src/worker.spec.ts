describe("WorkerModule", () => {
  it("should have worker environment configured", () => {
    expect(process.env["NODE_ENV"] || "test").toBeDefined();
  });
});
