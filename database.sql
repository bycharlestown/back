-- /////////////////
-- USERS INFORMATION
-- /////////////////

CREATE TABLE cards_info( 
    id varchar(80) PRIMARY KEY,
    image text,
    title text UNIQUE,
    description text,
    price_min INTEGER,
    price_max INTEGER
);     

CREATE TABLE full_descriptions(
    card_id varchar(80) references cards_info(id),
    title text UNIQUE references cards_info(title),
    category text NOT NULL,

    -- main info:
    num_enterpises text,
    num_franchises text,
    start_year text,
    start_period text,
    payback_period text,
    found_year text,

    -- price of franchise:
    lump_sum text,
    forecast_revenue text,
    forecast_net_income text,
    royalty_sum text,

    -- rest:
    company_descr text,
    franch_descr text,
    support_descr text,
    buyers_requirements text,
    quarters_requirements text
);


-- //////////
-- USERS DATA
-- //////////

CREATE TABLE users(
references cards_info
);