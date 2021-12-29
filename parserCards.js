/* https://www.youtube.com/watch?v=dljI-PgYSek&t=8s */

import ax from "axios";
import chee from "cheerio";
import { v4 as uuidv4 } from "uuid";
import pg from "pg";

const { get } = ax;
const { load } = chee;

// ELEPHANT SQL ***********************

const conString =
  "postgres://molwvggo:WGmorLxYyBWhBRvHQ0JQcYiXubolMKUu@abul.db.elephantsql.com/molwvggo";

const client = new pg.Client(conString);

// CLOUDINARY *************************

import cloudinary from "cloudinary";

cloudinary.config({
  cloud_name: "dwwijk4ok",
  api_key: "764797469776175",
  api_secret: "htxBCYfRJOW070qt2PjK2Hyj01I",
});

//////////////////////////// PARSER ////////////////////////////////////

class ParserCards {
  cardsInfo = [];

  ///////////////////////////////////////////////////////////////////////
  // PAGINATION FOR PARSING

  numFromStr(str) {
    let prices = str.split("—").map((s) => s.replace(/\D/g, ""));
    return prices.join(" — ");
  }

  ///////////////////////////////////////////////////////////////////////
  // CARDS PARSING

  async parseFranchiseInfo(url) {
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
              price: this.numFromStr(
                selector(element)
                  .find("p.fr-card-list__price > span:nth-child(2)")
                  .text()
              ),
              category: "category",
              fullDescription: await this.parseDescription(
                selector(element).find(".stretched-link").attr("href")
              ),
            });
          });

          // Masking img URL using Cloudinary
          this.changeImageURL(promiseCard);

          const promiseCardResult = await promiseCard;

          this.cardsInfo.push(promiseCardResult);
        });
      }

      return this.cardsInfo;
    } catch (error) {
      console.log(error);
    }
  }

  ///////////////////////////////////////////////////////////////////////
  // PARSING DESCRIPTION

  async parseDescription(url) {
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
              ?.replace(/\n/g, ""),
            mainInfo: selector(el)
              .find(".fr-page__basic-info-box")
              .text()
              ?.replace(/\n/g, ""),
            companyDescr: selector(el)
              .find("#company_descr_tpl")
              .text()
              ?.replace(/\n/g, ""),
            franchDescr: selector(el)
              .find("#franch_descr_tpl")
              .text()
              ?.replace(/\n/g, ""),
            supportDescr: selector(el)
              .find("#support_descr")
              .text()
              ?.replace(/\n/g, ""),
            buyersRequirements: selector(el)
              .find("#buyers_requirements_tpl")
              .text()
              ?.replace(/\n/g, ""),
            quartersRequirements: selector(el)
              .find("#quarters_requirements_tpl")
              .text()
              ?.replace(/\n/g, ""),
          });
        });

        const promiseDescriptionResult = await promiseDescription;

        franchiseData.push(promiseDescriptionResult);
      });

      return franchiseData;
    } catch (error) {
      console.log(error);
    }
  }

  ///////////////////////////////////////////////////////////////////////
  // PUSHING IMAGES TO CLOUDINARY

  changeImageURL(promiseCard) {
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
  }

  ///////////////////////////////////////////////////////////////////////
  // CALLING PARSE INFO

  async parseData() {
    try {
      console.log("THE PARSER WAS STARTED");

      client.connect();

      const results = await this.parseFranchiseInfo(
        "https://www.beboss.ru/franchise/search"
      );

      this.insertToDataBase(results);
    } catch (error) {
      console.log(error);
    } finally {
      console.log("THE PARSER WAS FINISHED");

      client.end();
      return;
    }
  }

  ///////////////////////////////////////////////////////////////////////
  // PUSHING TO THE DATA BASE

  insertToDataBase(results) {
    results.forEach((result, id) => {
      try {
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
            if (err) console.log("Query cards_info ERROR: ", title, err.stack);
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
            if (err)
              console.log("Query full_description ERROR: ", title, err.stack);
          }
        );
      } catch (error) {
        console.log(error);
      } finally {
        console.log(result.category, id, "was sent to the DB");
      }
    });
  }
}

const parsing = new ParserCards();

parsing.parseData();
