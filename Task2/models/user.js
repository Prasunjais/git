var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    loc: {
        type: Array,
        required: false

    },
    rand: {
        type: String,
        required: false
    },
    verify: {
        type: String,
        default: 0
    },
    otp: {
        type: String,
        default: 0
    }
});
//SET OTP
UserSchema.statics.setOTP = async(email, otp)=>{
    var exdata = {
        email: email
    };
    var userdata = {
      otp: otp
    };
    var result = await User.edit(exdata, userdata);
    if(result) {
        return true;
    }
    else {
        return false;
    }
};
UserSchema.statics.delOTP = async(email)=>{
        console.log("OTP is now geting deleted");
        await User.update({email: email}, {$unset: {otp: 0 }});
};
//VERIFY OTP
UserSchema.statics.verifyOTP = async(otp, email)=>{
        console.log("OTP VERIFICATION");
    var res = await User.findOne({"email": email,"otp": otp});
    if(res){
        return true;
    }else {
        return false;
    }
};
//Get the contact number
UserSchema.statics.getcontact = async(email)=>{
  var res = await User.findOne({"email": email});
  if(res)
  return res.contact;
  return null;
};
//VERIFICATION OF USER
UserSchema.statics.verify = async(rand, email)=>{
    console.log("INITIATING MODEL");
    var res = await User.findOne({ "email": email, "rand": rand});
    var email = email;
    console.log("---------->",res.username);
    if(res) {
        var userdata = {
            verify: '1'
        };

        var exdata = {
          email: email
        };
        var result = await User.edit(exdata, userdata);
        if(result) {
            return true;
        }
        else {
            return false;
        }
    } else {
        return false;
    }
}
//authenticate input against database
UserSchema.statics.authenticate = async(email, password)=>{
            console.log("INITIATING MODEL");
            var res = await User.findOne({ "email": email,"verify": '1'});
            if (res){
                console.log("---------->",res.username);
                var req =  await bcrypt.compare(password, res.password);
                if (req === true) {
                    return res;
                } else {
                    return null;
                }
            }
            else {
                return null;
            }
};
UserSchema.statics.gen_bcrypt = async(npass)=>{
    console.log("GENERATING BCRYPT FOR - ",npass);
    return bcrypt.hashSync(npass, 10);
};
//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    })
});
UserSchema.statics.edit = function(exdata, ndata) {
    return User.findOneAndUpdate(exdata, ndata);
};
UserSchema.statics.getuser = async (id)=>{
    return await User.findOne({'_id': id});
    };
var User = mongoose.model('clients', UserSchema);
module.exports = User;

