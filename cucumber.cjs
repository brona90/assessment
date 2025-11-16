module.exports = {
  default: {
    requireModule: ['@babel/register'],
    require: ['features/step_definitions/**/*.cjs'],
    format: ['progress', 'html:cucumber-report.html'],
    publishQuiet: true,
    timeout: 60000,
    worldParameters: {
      headless: true
    }
  }
}