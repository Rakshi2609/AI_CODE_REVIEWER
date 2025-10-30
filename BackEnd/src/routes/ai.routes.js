const express = require('express');
const aiController = require("../controllers/ai.controller")

const router = express.Router();

// Support optional language as a path param, e.g. POST /ai/get-review/javascript
// Also supports providing { language } in the JSON body.
router.post("/get-review/:language?", aiController.getReview)


module.exports = router;    