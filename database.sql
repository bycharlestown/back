-- /////////////////
-- USERS INFORMATION
-- /////////////////

CREATE TABLE full_descriptions(
    id SERIAL PRIMARY KEY,
    price_franchise text NOT NULL,
    main_info text NOT NULL,
    company_descr text NOT NULL,
    franch_descr text NOT NULL,
    support_descr text NOT NULL,
    buyers_requirements text NOT NULL,
    quarters_requirements text NOT NULL
);

CREATE TABLE cards_info( 
    id SERIAL PRIMARY KEY,
    image text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    price text NOT NULL,
    category text NOT NULL,
    full_description INTEGER REFERENCES full_descriptions(id)
);   

-- //////////
-- USERS DATA
-- //////////

CREATE TABLE users(
references cards_info
);