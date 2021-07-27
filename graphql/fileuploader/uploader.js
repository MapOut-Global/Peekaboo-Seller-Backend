
const { GraphQLUpload } = require('graphql-upload');
const fs = require('fs');

// util.upload.js
const uploadFile = ({ filename, stream }) => {
	stream
		.pipe(fs.createWriteStream('../../uploads/avtar/'+filename))
		.on('finish', () => Promise.resolve())
		.on('error', Promise.reject)
}

const validateFile = ({ filename, stream }) => {
	const extFile = filename.replace('.', '')
    
	const extPattern = /(jpg|jpeg|png|gif|svg)/gi.test(extFile)
	if (!extPattern) throw new TypeError('Image format is not valid')

	const fileExits = fs.existsSync(Promise.resolve(process.cwd(), '../../uploads/avtar/'+filename))
	if (!fileExits) return uploadFile({ filename, stream })

	fs.unlink(Promise.resolve(process.cwd(), '../../uploads/avtar/'+filename), (error) => {
		if (error) throw error
		return uploadFile({ filename, stream })
	})
}

module.exports =  fileUpload = ({ filename, stream }) =>
	filename ? validateFile({ filename, stream }) : new Error('Image is required')