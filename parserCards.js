/* https://www.youtube.com/watch?v=dljI-PgYSek&t=8s */

import ax from "axios";
const { get } = ax;
import chee from "cheerio";
const { load } = chee;
import { v4 as uuidv4 } from "uuid";

// ELEPHANT SQL ***********************

import pg from "pg";

const conString =
  "postgres://molwvggo:WGmorLxYyBWhBRvHQ0JQcYiXubolMKUu@abul.db.elephantsql.com/molwvggo";

const client = new pg.Client(conString);

client.connect();

// ************************************

// CLOUDINARY *************************

import cloudinary from "cloudinary";

cloudinary.config({
  cloud_name: "dwwijk4ok",
  api_key: "764797469776175",
  api_secret: "htxBCYfRJOW070qt2PjK2Hyj01I",
});

// ***********************************

function numFromStr(str) {
  let prices = str.split("—").map((s) => s.replace(/\D/g, ""));
  return prices.join(" — ");
}

///////////////////////////////////////////////////////////////////////
// CARDS PARSING

const cardsInfo = [];

const parseFranchiseInfo = async (url) => {
  try {
    const getHTML = async (url) => {
      const { data } = await get(url);

      return load(data);
    };

    const $ = await getHTML(`${url}`);

    const pageNumber = $("li.pagination-line__item").eq(-2).text();

    for (let currentPage = 1; currentPage <= pageNumber; currentPage++) {
      const selector = await getHTML(`${url}-p-${currentPage}`);

      selector(".tdb-view__item").each(async (i, element) => {
        // CARDS DESCRIPTION PARSING

        const promiseCard = await new Promise(async (resolve, reject) => {
          const getImage = selector(element)
            .find("img.tdb-view__picture")
            .attr("src")
            .endsWith(".jpg")
            ? `https://www.beboss.ru${selector(element)
                .find("img.tdb-view__picture")
                .attr("src")}`
            : "https://res.cloudinary.com/dwwijk4ok/image/upload/v1640696711/NOT%20DELETE/Yellow_icon.svg_oh0yxs.png";

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
            category: "category",
            fullDescription: await parseDescription(
              selector(element).find(".stretched-link").attr("href")
            ),
          });
        });

        // Masking img URL using Cloudinary
        changeImageURL(promiseCard);

        const promiseCardResult = await promiseCard;

        cardsInfo.push(promiseCardResult);
      });
    }

    return cardsInfo;
  } catch (error) {
    console.log(error);
  }
};

///////////////////////////////////////////////////////////////////////
// PARSING DESCRIPTION

const parseDescription = async (url) => {
  try {
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
      const promiseDescription = await new Promise((resolve, reject) => {
        return resolve({
          priceFranchise: selector(el)
            .find(".fr-page__price-inner")
            .text()
            ?.replace(/(\n)||(&nbsp;)/, ""),
          mainInfo: selector(el)
            .find(".fr-page__basic-info-box")
            .text()
            ?.replace(/(\n)||(&nbsp;)/, ""),
          companyDescr: selector(el)
            .find("#company_descr_tpl")
            .text()
            ?.replace(/\n/, ""),
          franchDescr: selector(el)
            .find("#franch_descr_tpl")
            .text()
            ?.replace(/\n/, ""),
          supportDescr: selector(el)
            .find("#support_descr")
            .text()
            ?.replace(/\n/, ""),
          buyersRequirements: selector(el)
            .find("#buyers_requirements_tpl")
            .text()
            ?.replace(/\n/, ""),
          quartersRequirements: selector(el)
            .find("#quarters_requirements_tpl")
            .text()
            ?.replace(/\n/, ""),
        });
      });

      const promiseDescriptionResult = await promiseDescription;

      franchiseData.push(promiseDescriptionResult);
    });

    return franchiseData;
  } catch (error) {
    console.log(error);
  }
};

///////////////////////////////////////////////////////////////////////
// PUSHING IMAGES TO CLOUDINARY

const changeImageURL = function (promiseCard) {
  const imageURL = `${promiseCard.image}`;
  const imageTitle = `images/${promiseCard.title}`;

  cloudinary.v2.uploader.upload(
    imageURL,
    { public_id: imageTitle },
    function (error, result) {
      if (!result) {
        console.log("CATEGORY: ", promiseCard.category);
        console.log("TITLE: ", imageTitle);
        console.log("INCORRECT URL: ", promiseCard.image);
        console.log("ERROR INFO: ", error);
        return;
      }

      promiseCard.image = result.url;
    }
  );
};

///////////////////////////////////////////////////////////////////////

// const sources = [
// "auto", //61
//   "children", //200
//   "it", //110
//   "health", //43
//   "study", //143
//   "entertainment", 106
//   "food", //262
//   "production", //75
//   "retail", //476
//   "beauty", //136
//   "construction", //42
//   "b2b-services", //173
//   "services", //297
//   "finances", //51
// ];

const parseData = async function () {
  try {
    console.log("THE PARSER WAS STARTED");

    const results = await parseFranchiseInfo(
      "https://www.beboss.ru/franchise/search"
    );
    insertToDataBase(results);
  } catch (error) {
    console.log(error);
  } finally {
    console.log("THE PARSER WAS FINISHED");

    client.end();
  }
};

const insertToDataBase = function (results) {
  results.forEach((result, id) => {
    const image = result.image;
    const title = result.title;
    const description = result.description;
    const price = result.price;
    const category = result.category;

    const fullDescription = result.fullDescription[0];
    const uniqueID = uuidv4();
    const priceFranchise = fullDescription.priceFranchise;
    const mainInfo = fullDescription.mainInfo;
    const companyDescr = fullDescription.companyDescr;
    const franchDescr = fullDescription.franchDescr;
    const supportDescr = fullDescription.supportDescr;
    const buyersRequirements = fullDescription.buyersRequirements;
    const quartersRequirements = fullDescription.quartersRequirements;

    client.query(
      "INSERT INTO cards_info(id, image, title, description, price, category) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;",
      [uniqueID, image, title, description, price, category],
      (err, res) => {
        if (err) console.log(err.stack);
      }
    );

    client.query(
      "INSERT INTO full_descriptions(card_id, price_franchise, main_info, company_descr, franch_descr, support_descr, buyers_requirements, quarters_requirements) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;",
      [
        uniqueID,
        priceFranchise,
        mainInfo,
        companyDescr,
        franchDescr,
        supportDescr,
        buyersRequirements,
        quartersRequirements,
      ],
      (err, res) => {
        if (err) console.log(err.stack);
      }
    );

    console.log(result.category, id, "was sent to the DB");
  });
};

export default parseData;
