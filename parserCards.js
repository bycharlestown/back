/* https://www.youtube.com/watch?v=dljI-PgYSek&t=8s */

import ax from "axios";
const { get } = ax;
import chee from "cheerio";
const { load } = chee;
import fs from "fs";

// CLOUDINARY *************************

import cloudinary from "cloudinary";

cloudinary.config({
  cloud_name: "dwwijk4ok",
  api_key: "764797469776175",
  api_secret: "htxBCYfRJOW070qt2PjK2Hyj01I",
});

// ***********************************

const cardsInfo = [];

function numFromStr(str) {
  let prices = str.split("—").map((s) => s.replace(/\D/g, ""));
  return prices.join(" — ");
}

const writeFile = (writeData) => {
  fs.writeFile(
    "./cardsInfo.json",

    `${JSON.stringify(...writeData, null, 2)}`,
    (err) => {
      if (err) throw err;
      console.log("Data has been replaced!");
    }
  );
};

////////////////////////////////////////////////////////////////////

// CARDS PARSING

const parseFranchiseInfo = async (url, category) => {
  try {
    // В этот массив попадают объекты сформированные в цикле
    const getHTML = async (url) => {
      try {
        const { data } = await get(url);

        return load(data);
      } catch (error) {
        console.log("ERR GET HTML: ", error);
      }
    };

    const $ = await getHTML(`${url}`);

    const pageNumber = $("li.pagination-line__item").eq(-2).text();

    for (let currentPage = 1; currentPage <= pageNumber; currentPage++) {
      const selector = await getHTML(`${url}-p-${currentPage}`);

      selector(".tdb-view__item").each(async (i, element) => {
        // На каждой итерации создается объект с данными о франшизе

        ///////////////////////////////////////////////////////////////////////////////////
        // CARDS DESCRIPTION PARSING
        const parseDescription = async (url) => {
          try {
            // В этот массив попадают объекты сформированные в цикле
            const getHTML = async (url) => {
              try {
                const { data } = await get(url);

                return load(data);
              } catch (error) {
                console.log(error);
              }
            };

            const $ = await getHTML(`${url}`);

            const selector = await getHTML(`${url}`);

            let franchiseData = [];

            selector(".fr-page").each(async (i, el) => {
              const promiseDescription = await new Promise(
                (resolve, reject) => {
                  return resolve({
                    priceFranchise: selector(el)
                      .find(".fr-page__price-inner")
                      .html(),
                    mainInfo: selector(el)
                      .find(".fr-page__basic-info-box")
                      .html(),
                    companyDescr: selector(el)
                      .find("#company_descr_tpl")
                      .html(),
                    franchDescr: selector(el).find("#franch_descr_tpl").html(),
                    supportDescr: selector(el).find("#support_descr").html(),
                    buyersRequirements: selector(el)
                      .find("#buyers_requirements_tpl")
                      .html(),
                    quartersRequirements: selector(el)
                      .find("#quarters_requirements_tpl")
                      .html(),
                  });
                }
              );

              const promiseDescriptionResult = await promiseDescription;

              franchiseData.push(promiseDescriptionResult);
            });

            return franchiseData;
          } catch (error) {
            console.log(error);
          }
        };

        ///////////////////////////////////////////////////////////////////////////////////////////

        const promiseCard = await new Promise(async (resolve, reject) => {
          const getImage = selector(element)
            .find("img.tdb-view__picture")
            .attr("src")
            .endsWith(".jpg")
            ? `https://www.beboss.ru${selector(element)
                .find("img.tdb-view__picture")
                .attr("src")}`
            : "C:/Users/macks/Traffic House/back/Yellow_icon.svg.png";

          return resolve({
            image: getImage,
            title: selector(element).find("h3.tdb-view__text").text(),
            description: selector(element)
              .find("span.fr-card-list__description")
              .text(),
            price: numFromStr(
              selector(element)
                .find("p.fr-card-list__price > span:nth-child(2)")
                .text()
            ),
            category: category,
            // link: selector(element).find("a.stretched-link").attr("href"),
            fullDescription: await parseDescription(
              selector(element).find(".stretched-link").attr("href")
            ),
          });
        });

        const promiseCardResult = await promiseCard;

        // console.log(promiseCardResult.image, promiseCardResult.title);

        // Masking img URL using Cloudinary

        const changeImageURL = function () {
          // if (!promiseCardResult.image) {
          //   console.log(promiseCardResult.image, promiseCardResult.title);
          //   return;
          // }

          const imageURL = `${promiseCardResult.image}`;
          const imageTitle = `images/${promiseCardResult.title}`;

          cloudinary.v2.uploader.upload(
            imageURL,
            { public_id: imageTitle },
            function (error, result) {
              if (!result) {
                console.log("INCORRECT URL: ", promiseCardResult.image);
                console.log("ERROR INFO: ", error);
                return;
              }

              promiseCardResult.image = result.url;
            }
          );
        };
        changeImageURL();

        cardsInfo.push(promiseCardResult);
      });
    }
    // console.log(cardsInfo[0]); // Checking output
    return cardsInfo;
  } catch (error) {
    console.log(error);
  }
};

Promise.all([
  parseFranchiseInfo(`https://www.beboss.ru/franchise/search-c-auto`, "auto"),
  // parseFranchiseInfo(
  //   `https://www.beboss.ru/franchise/search-c-children`,
  //   "children"
  // ),
  // parseFranchiseInfo(`https://www.beboss.ru/franchise/search-c-it`, "it"),
  // parseFranchiseInfo(
  //   `https://www.beboss.ru/franchise/search-c-health`,
  //   "health"
  // ),
  // parseFranchiseInfo(`https://www.beboss.ru/franchise/search-c-study`, "study"),
  // parseFranchiseInfo(
  //   `https://www.beboss.ru/franchise/search-c-entertainment`,
  //   "entertainment"
  // ),
  // parseFranchiseInfo(`https://www.beboss.ru/franchise/search-c-food`, "food"),
  // parseFranchiseInfo(
  //   `https://www.beboss.ru/franchise/search-c-production`,
  //   "production"
  // ),
  // parseFranchiseInfo(
  //   `https://www.beboss.ru/franchise/search-c-retail`,
  //   "retail"
  // ),
  // parseFranchiseInfo(
  //   `https://www.beboss.ru/franchise/search-c-beauty`,
  //   "beauty"
  // ),
  // parseFranchiseInfo(
  //   `https://www.beboss.ru/franchise/search-c-construction`,
  //   "construction"
  // ),
  // parseFranchiseInfo(
  //   `https://www.beboss.ru/franchise/search-c-b2b-services`,
  //   "b2b"
  // ),
  // parseFranchiseInfo(
  //   `https://www.beboss.ru/franchise/search-c-services`,
  //   "services"
  // ),
  // parseFranchiseInfo(
  //   `https://www.beboss.ru/franchise/search-c-finances`,
  //   "finances"
  // ),
]).then((values) => {
  writeFile(values);
});
