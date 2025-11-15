export default {
  default: {
    require: ['features/step_definitions/**/*.js'],
    format: ['progress', 'html:cucumber-report.html'],
    publishQuiet: true
  }
}