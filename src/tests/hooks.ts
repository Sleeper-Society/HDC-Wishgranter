import sinon from "sinon";

// Restores the default sandbox after every test
(exports as { mochaHooks?: unknown }).mochaHooks = {
  afterEach() {
    sinon.restore();
  },
};
