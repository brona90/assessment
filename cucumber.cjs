module.exports = {
  default: {
    requireModule: ['@babel/register'],
    require: ['features/step_definitions/**/*.cjs'],
    format: ['summary', 'html:cucumber-report.html'],
    publishQuiet: true,
    timeout: 60000,
    parallel: 10,
    worldParameters: {
      headless: true
    }
  }
}