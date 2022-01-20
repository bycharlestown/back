import ax from "axios";
import chee from "cheerio";
import { v4 as uuidv4 } from "uuid";
import pg from "pg";
import cloudinary from "cloudinary";

const { get } = ax;
const { load } = chee;

// ELEPHANT SQL ***********************

const conString =
  "postgres://molwvggo:WGmorLxYyBWhBRvHQ0JQcYiXubolMKUu@abul.db.elephantsql.com/molwvggo";

const client = new pg.Client(conString);

// CLOUDINARY *************************

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

  numFromStr(price, deltaPrice) {
    let prices = price.split("—").map((s) => s.replace(/\D/g, ""));
    if (deltaPrice === "minPrice") return Number(prices[0]);
    else if (deltaPrice === "maxPrice" && prices[1]) return Number(prices[1]);
    return Number(prices[0]);
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
              priceMax: this.numFromStr(
                selector(element)
                  .find("p.fr-card-list__price > span:nth-child(2)")
                  .text(),
                "maxPrice"
              ),
              priceMin: this.numFromStr(
                selector(element)
                  .find("p.fr-card-list__price > span:nth-child(2)")
                  .text(),
                "minPrice"
              ),
              fullDescription: await this.parseDescription(
                selector(element).find(".stretched-link").attr("href")
              ),
            });
          });

          // Masking img URL using Cloudinary
          // this.changeImageURL(promiseCard);

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

      selector(".main").each(async (i, el) => {
        const promiseDescription = await new Promise((resolve, reject) => {
          return resolve({
            category: selector(el)
              .find("ul.breadcrumb-new > li:nth-child(2) > a")
              .attr("href")
              .replace(/.*?-c-/gi, ""),
            lumpSum: selector(el)
              .find(".fr-page__item-title")
              .filter(function (i, el) {
                return $(el).text().includes("в том числе паушальный взнос");
              })
              .find("span")
              .text()
              .replace(/\&nbsp;/g, " "),
            forecastRevenue: selector(el)
              .find(".fr-page__item-title")
              .filter(function (i, el) {
                return $(el).text().includes("Прогнозируемая выручка");
              })
              .find("span")
              .text()
              .replace(/\&nbsp;/g, " "),
            forecastNetIncome: selector(el)
              .find(".fr-page__item-title")
              .filter(function (i, el) {
                return $(el).text().includes("Возможная чистая прибыль");
              })
              .find("span")
              .text()
              .replace(/\&nbsp;/g, " "),
            royaltySum: selector(el)
              .find(".fr-page__item-title")
              .filter(function (i, el) {
                return $(el).text().includes("Роялти");
              })
              .find("span")
              .text(),
            numEnterpises: selector(el)
              .find(".fr-page__basic-info-text")
              .filter(function (i, el) {
                return $(el).text().includes("Собственных предприятий");
              })
              .find("span")
              .text(),
            numFranchises: selector(el)
              .find(".fr-page__basic-info-text")
              .filter(function (i, el) {
                return $(el).text().includes("Франшизных предприятий");
              })
              .find("span")
              .text(),
            startYear: selector(el)
              .find(".fr-page__basic-info-text")
              .filter(function (i, el) {
                return $(el).text().includes("Год запуска франчайзинга");
              })
              .find("span")
              .text(),
            startPeriod: selector(el)
              .find(".fr-page__basic-info-text")
              .filter(function (i, el) {
                return $(el).text().includes("Срок запуска бизнеса");
              })
              .find("span")
              .text(),
            paybackPeriod: selector(el)
              .find(".fr-page__basic-info-text")
              .filter(function (i, el) {
                return $(el).text().includes("Срок окупаемости");
              })
              .find("span")
              .text(),
            foundYear: selector(el)
              .find(".fr-page__basic-info-text")
              .filter(function (i, el) {
                return $(el).text().includes("Год основания компании");
              })
              .find("span")
              .text(),
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
      // client.end();
      return;
    }
  }

  ///////////////////////////////////////////////////////////////////////
  // PUSHING TO THE DATA BASE

  insertToDataBase(results) {
    results.forEach((result, id) => {
      try {
        const uniqueID = uuidv4();

        // cards info TABLE:
        const image = result.image;
        const title = result.title;
        const description = result.description;
        const priceMin = result.priceMin;
        const priceMax = result.priceMax;

        // full descriptions TABLE:
        const fullDescription = result.fullDescription[0];
        const category = fullDescription.category;

        ///////// main franchise info:
        const numEnterpises = fullDescription.numEnterpises;
        const numFranchises = fullDescription.numFranchises;
        const startYear = fullDescription.startYear;
        const startPeriod = fullDescription.startPeriod;
        const paybackPeriod = fullDescription.paybackPeriod;
        const foundYear = fullDescription.foundYear;

        //////// price franchise:
        const lumpSum = fullDescription.lumpSum;
        const forecastRevenue = fullDescription.forecastRevenue;
        const forecastNetIncome = fullDescription.forecastNetIncome;
        const royaltySum = fullDescription.royaltySum;

        //////// rest franchise info:
        const companyDescr = fullDescription.companyDescr;
        const franchDescr = fullDescription.franchDescr;
        const supportDescr = fullDescription.supportDescr;
        const buyersRequirements = fullDescription.buyersRequirements;
        const quartersRequirements = fullDescription.quartersRequirements;

        client.query(
          `
          INSERT INTO cards_info (
            id, 
            image, 
            title, 
            description, 
            price_min, 
            price_max
            )
          VALUES ($1, $2, $3, $4, $5, $6) 
          ON CONFLICT (title) 
          WHERE ((title)::text = $3::text) 
          DO 
          UPDATE SET image = $2, 
                     title = $3, 
                     description = $4, 
                     price_min = $5, 
                     price_max = $6; 
          `,
          [uniqueID, image, title, description, priceMin, priceMax],
          (err, res) => {
            if (err)
              console.log(
                "QUERY: INSERT/UPDATE cards_info ERROR: ",
                title,
                err.stack
              );
          }
        );

        client.query(
          `
          INSERT INTO full_descriptions (
            card_id, 
            title, 
            category, 
            
            num_enterpises,
            num_franchises,
            start_year,
            start_period,
            payback_period,
            found_year, 

            lump_sum,
            forecast_revenue,
            forecast_net_income,
            royalty_sum,

            company_descr, 
            franch_descr, 
            support_descr, 
            buyers_requirements, 
            quarters_requirements
            ) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) 
          ON CONFLICT (title) 
          WHERE ((title)::text = $2::text) 
          DO 
          UPDATE SET title = $2, 
                     category = $3, 

                     num_enterpises = $4,
                     num_franchises = $5,
                     start_year = $6,
                     start_period = $7,
                     payback_period = $8,
                     found_year = $9, 

                     lump_sum = $10,
                     forecast_revenue = $11,
                     forecast_net_income = $12,
                     royalty_sum = $13,

                     company_descr = $14, 
                     franch_descr = $15, 
                     support_descr = $16, 
                     buyers_requirements = $17, 
                     quarters_requirements = $18;
          `,
          [
            uniqueID,
            title,
            category,

            numEnterpises,
            numFranchises,
            startYear,
            startPeriod,
            paybackPeriod,
            foundYear,

            lumpSum,
            forecastRevenue,
            forecastNetIncome,
            royaltySum,

            companyDescr,
            franchDescr,
            supportDescr,
            buyersRequirements,
            quartersRequirements,
          ],
          (err, res) => {
            if (err)
              console.log(
                "QUERY: INSERT/UPDATE full_descriptions ERROR: ",
                title,
                err.stack
              );
          }
        );
      } catch (error) {
        console.log(error);
      } finally {
        console.log(
          result.fullDescription[0].category,
          result.title,
          id + 1,
          "was sent to the Data Base"
        );
      }
    });
  }
}

// export default new ParserCards();

let start = new ParserCards();
start.parseData();
