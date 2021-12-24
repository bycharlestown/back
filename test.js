import cloudinary from "cloudinary";

cloudinary.config({
  cloud_name: "dwwijk4ok",
  api_key: "764797469776175",
  api_secret: "htxBCYfRJOW070qt2PjK2Hyj01I",
  secure: true,
});

const imageURL = [
  {
    image:
      "https://www.beboss.ru/listings/fr/1824/photos/xmd_frTzVQ84.jpg.pagespeed.ic.O6kB9dFhoH.jpg",
    title: "AAA - error",
  },
  {
    image:
      "https://www.beboss.ru/listings/fr/3825/photos/xmd_frfTBku2.jpg.pagespeed.ic.v361cCsjB_.jpg",

    title: "BBB",
  },
  {
    image:
      "https://www.beboss.ru/listings/fr/3829/photos/xmd_frq3ZvQw.jpeg.pagespeed.ic.foxmNvBSpe.jpg",

    title: "CCC",
  },
];

imageURL.forEach(function (el) {
  const url = el.image;
  const imgTitle = el.title;

  cloudinary.v2.uploader.upload(
    el.image,
    { public_id: `images/${imgTitle}` },
    function (error, result) {
      console.log("URL: ", result.url, error);
    }
  );
});

// cloudinary.v2.uploader.upload(
//   "https://www.beboss.ru/listings/fr/3402/photos/xmd_frXbwTTH.jpg.pagespeed.ic.m9tyeJ4JtR.jpg",
//   { public_id: "Франшиза GEIZER" },
//   function (error, result) {
//     console.log("URL: ", result.url);
//   }
// );

////////////////////////ASYNC PARSER////////////////////////////////
// const data1 = [
//   {
//     name: "John",
//     age: "18",
//     description: [],
//   },
//   {
//     name: "Mark",
//     age: "20",
//     description: [],
//   },
//   {
//     name: "Peter",
//     age: "15",
//     description: [],
//   },
// ];

// const data2 = { sex: "MALE", family: "FULL" };

// async function getData1() {
//   const infos = await getData2();

//   console.log("DATA 2: ", infos);

//   for await (const data of data1) {
//     data.description.push(infos);
//   }

//   console.log(data1[0].description);
// }

// async function getData2() {
//   return Promise.resolve(data2).then((x) => {
//     console.log("getData2(): ", x);
//     return x;
//   });
// }

// getData1();
