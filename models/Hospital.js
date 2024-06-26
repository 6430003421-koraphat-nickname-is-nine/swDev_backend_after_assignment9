const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true , 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50 , 'Name can not be more than 50 charactors']
    },
    address:{
        type: String,
        required: [true , 'Please add an address']
    },
    district:{
        type: String,
        required: [true , 'Please add a district']
    },
    province:{
        type: String,
        required: [true , 'Please add a province']
    },
    postalcode:{
        type: String,
        required: [true , 'Please add a postal code'],
        maxlength: [5 , 'Postal Code can not be more than 5 digits']
    },
    tel:{
        type: String
    },
    region:{
        type: String,
        required: [true , 'Please add a region']
    }
},{
    toJSON: {virtuals:true},
    toObject : {virtuals:true}
});

//Cascade Delete appointments when a hospital is deleted 
HospitalSchema.pre('deleteOne',{document:true , query: false}, async function(next){
    console.log(`Apointments being remove from hospital ${this._id}`);
    await this.model('Appointment').deleteMany({hospital : this._id});
    next();
});

// Reverse populate with virtuals
HospitalSchema.virtual('appointments' , {
    ref: "Appointment",
    localField :  "_id",
    foreignField : 'hospital',
    justOne:false
})

module.exports = mongoose.model('Hospital', HospitalSchema);