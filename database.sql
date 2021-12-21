-- /////////////////
-- USERS INFORMATION
-- /////////////////

CREATE TABLE images(
    id SERIAL PRIMARY KEY,
    url text NOT NULL
);

CREATE TABLE global_descriptions(
    id SERIAL PRIMARY KEY,
    priceFranchise text NOT NULL,
    mainInfo text NOT NULL,
    companyDescr text NOT NULL,
    franchDescr text NOT NULL,
    supportDescr text NOT NULL,
    buyersRequirements text NOT NULL,
    quartersRequirements text NOT NULL
);

CREATE TABLE cards_info( 
    id SERIAL PRIMARY KEY,
    image INTEGER REFERENCES images(id),
    title text NOT NULL,
    description text NOT NULL,
    price text NOT NULL,
    category text NOT NULL,
    global_description INTEGER REFERENCES global_descriptions(id)
);   

-- //////////
-- USERS DATA
-- //////////

CREATE TABLE users(
references cards_info
);