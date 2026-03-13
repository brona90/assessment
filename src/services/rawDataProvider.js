// Loads the static JSON data files over the network.
// In the single-file build this module is aliased to rawDataProvider.embedded.js
// which imports the same files as bundled JSON — no fetch needed.

export async function loadRawData() {
  const base = import.meta.env.BASE_URL;
  const [questions, users, compliance] = await Promise.all([
    fetch(`${base}data/questions.json`).then(r => r.json()),
    fetch(`${base}data/users.json`).then(r => r.json()),
    fetch(`${base}data/compliance.json`).then(r => r.json())
  ]);
  return { questions, users, compliance };
}
