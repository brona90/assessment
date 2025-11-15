export default {
  default: {
    requireModule: ['@babel/register'],
    require: ['features/step_definitions/**/*.js'],
    format: ['progress', 'html:cucumber-report.html'],
    publishQuiet: true,
    timeout: 15000,
    worldParameters: {
      headless: true
    }
  }
}