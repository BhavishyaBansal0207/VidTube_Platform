import multer from "multer"
/*
Multer is a Node.js middleware for Express.js used for handling multipart/form-data, which is primarily used for uploading files.
Key Features of Multer

• File Uploads: Processes incoming file data sent from client-side forms and attaches it to the request object (req.file or req.files).

• Storage Options: Supports saving files directly to the server disk via diskStorage or keeping them temporarily in memory via memoryStorage.

• File Filtering: Allows you to control which files are accepted based on mimetype, extension, or size limits.

• Custom Naming: Lets you configure custom or timestamp-based filenames to prevent naming conflicts

*/


/*
    First the user uploads the file and we store it in on our disk and then we will upload this on cloudinary 

    Cloudinary is a " Media Management Platform "

    we have installed cloudinary, multer, cookie-parser
*/

/*
 In Multer (a Node.js middleware for handling file uploads), the callback function (usually written as cb or callback) is used to pass control back to Multer after you have determined where to store a file or what to name it.

 Because deciding file locations or checking file names can take time (asynchronous operations), Multer uses this callback function to wait for your decision before it actually writes the file to your disk or memory.
*/


 /**
    A MIME type (which stands for Multipurpose Internet Mail Extensions, and is now formally called a media type) is a standardized label used to identify the format and nature of a file or digital document.
    While operating systems like Windows use file extensions (like .html or .png) to know how to open a file, web browsers and servers use MIME types to determine how to process and display data over the internet. For example, when a server sends a file to a browser, it includes the MIME type in the Content-Type HTTP header so the browser knows whether to show it as a webpage, display it as an image, or download 
*/

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./public/temp")
    },
    filename: function(req, file, cb){
         // 2. Generate unique numeric string
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        
        // 3. Extract the extension (e.g., '.png' or '.jpg')
        const fileExtension = path.extname(file.originalname).toLowerCase();
        
        // 4. Stitch everything together cleanly
        // Result looks like: avatar-1717200000-847392019.png
        cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
    }
})

export const upload = multer({
    storage
}) 

