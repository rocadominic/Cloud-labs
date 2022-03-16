const hostname = 'localhost';
const port = 4444;

const router = require('./router.js');

router.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});