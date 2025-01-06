require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const isUrl = require('is-url');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const app = express();


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const urlSchema = new mongoose.Schema({
  url: String,
})

let URL = mongoose.model("URL",urlSchema)

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyparser.urlencoded({ extended: true }))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


// app.route('/api/shorturl/:shorturl?')
// .get(function(req, res){
//   console.log("GET REQUEST");
//   // window.location.replace(res.);
// })
// .post(function(req, res){
//   console.log("POST REQUEST");
//   console.log("reqreqreq");
//   console.log(req);
//   dns.lookup(req.body.url, (err, address, family) => {
//     if (err) {
//         console.error('Error:', err.message);
//         res.json({
//           error: err
//         });
//         return;
//     }
    
//     console.log(`Address: ${address}`);
//     console.log(`Family: IPv${family}`);

//     res.json({
//       original_url: '',
//       short_url: ''
//     });
//   });
  
// })

app.get('/api/shorturl/:redirect_url',async function(req, res){
  console.log("SHORT URL ", req.params.redirect_url);
  const query = URL.findById(req.params.redirect_url);
  query.select('_id url short');
  const result = await query.exec();
  console.log("RESULT", result);
  if(result){
    res.redirect(result.url);
    return;
  }
})


app.post('/api/shorturl',async function(req, res){
  const url = req.body.url;
  console.log("URL", url);

  if(!isUrl(url)){
    res.json({
      error: 'invalid url'
    });
    return;
  }
  try {

    
    // const hostname = new URL(url).hostname;
    const query = URL.find({url: url});
    query.select('_id url short');


    let urlObject = await query.exec();

    if(urlObject.length == 0){
      urlObject = await saveNewUrl(url);
    }
    if(urlObject === undefined) {
      const query1 = URL.find({url: url});
      query1.select('_id url short');
      urlObject = await query1.exec();
    }

    console.log(urlObject);

    res.json({
      original_url: urlObject[0].url,
      short_url: urlObject[0]._id
    });
  } catch (error) {
    console.error('Error while querying:', error);
  }
})


async function saveNewUrl(url){
  let urlModel = URL({
    url: url,
  });
  await urlModel.save()
    .then((savedData)=>{
      return savedData;
    });
}


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
