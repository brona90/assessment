// Embedded data provider for the single-file build.
// Returns the same data as rawDataProvider.js but from bundled JSON
// instead of fetch() — works with no server and no network.

import questions from '../../public/data/questions.json';
import users from '../../public/data/users.json';
import compliance from '../../public/data/compliance.json';

export async function loadRawData() {
  return { questions, users, compliance };
}
