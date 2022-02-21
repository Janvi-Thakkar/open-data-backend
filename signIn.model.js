const mongoose = require('mongoose');
const signIn = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    org: {
        type: String,
        required: true,
    },

},
    {collection: ""}
)

const signInModel = mongoose.model("signInModel", signIn);

module.exports = signInModel;

