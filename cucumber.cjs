module.exports = {
  default: {
    requireModule: ['@babel/register'],
    require: ['features/step_definitions/**/*.cjs'],
    format: ['summary', 'html:cucumber-report.html'],
    publishQuiet: true,
    timeout: 60000,
    parallel: 5, // Reduced from 10 to avoid port conflicts
    worldParameters: {
      headless: true
    }
  }
}