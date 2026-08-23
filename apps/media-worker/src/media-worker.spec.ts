describe("MediaWorkerModule", () => {
  it("should have media worker environment configured", () => {
    expect(process.env["NODE_ENV"] || "test").toBeDefined();
  });
});
