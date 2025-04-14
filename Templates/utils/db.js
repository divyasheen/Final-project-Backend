import mongoose from 'mongoose';

export const connect2DB = async() => {
    try {
        mongoose.connection.on('connected', 
            ()=>console.log('✅ DB Connection Established.'));
        mongoose.connection.on('error',
            (err)=> console.error(err.message));
    
        const con2DB = await mongoose.connect(process.env.mongoUri);
        
    } catch (error) {
        console.error(error.message);
    }
}