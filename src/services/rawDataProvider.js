// Loads the static JSON data files over the network.
// In the single-file build this module is aliased to rawDataProvider.embedded.js
// which imports the same files as bundled JSON — no fetch needed.

export async function loadRawData() {
  const [questions, users, compliance] = await Promise.all([
    fetch('/assessment/data/questions.json').then(r => r.json()),
    fetch('/assessment/data/users.json').then(r => r.json()),
    fetch('/assessment/data/compliance.json').then(r => r.json())
  ]);
  return { questions, users, compliance };
}
