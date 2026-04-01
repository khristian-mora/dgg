const bcrypt = require('bcrypt');
const fs = require('fs');
async function test() {
  const isMatch1 = await bcrypt.compare('admin123', '$2b$10$HIinyRgVpbY6l/pXsHAxfOee20FuMsQhiOLBITnrFQVb80Z.0IP5S');
  const isMatch2 = await bcrypt.compare('admin123', '$2b$10$wgEQzwuz2fc6P8iyD5WxWOv3b.ZvsOF1ynC4LegdQZFyuES301azu');
  fs.writeFileSync('test_pwd_result.txt', `admin@dggestionarmas.com admin123: ${isMatch1}\nadmin@dgg.com admin123: ${isMatch2}`);
}
test();
