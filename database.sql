-- /////////////////
-- USERS INFORMATION
-- /////////////////

CREATE TABLE cards_info( 
    id integer PRIMARY KEY,
    image text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    price text NOT NULL,
    category text NOT NULL
);   

CREATE TABLE full_descriptions(
    card_id integer references cards_info(id),
    price_franchise text,
    main_info text,
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