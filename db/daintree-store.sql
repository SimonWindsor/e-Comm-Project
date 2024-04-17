CREATE TABLE IF NOT EXISTS "items" (
	"id" int PRIMARY KEY,
	"description" text,
	"num_available" int NOT NULL,
	"price" money NOT NULL
);

CREATE TABLE IF NOT EXISTS "addresses" (
	"id" int PRIMARY KEY,
	"street" varchar(30) NOT NULL,
	"locality" varchar(20) NOT NULL,
	"state_province" varchar(20) NOT NULL,
	"country" varchar(20) NOT NULL,
	"zipcode" varchar(10) NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
	"email" varchar(30) PRIMARY KEY,
	"first_name" varchar(15) NOT NULL,
	"last_name" varchar(15) NOT NULL,
	"phone_number" varchar(15) NOT NULL,
	"address_id" int NOT NULL,
  
  FOREIGN KEY ("address_id") REFERENCES "addresses"("id")
);

CREATE TABLE IF NOT EXISTS "reviews" (
	"id" int PRIMARY KEY,
	"item_id" int NOT NULL,
	"user_email" varchar(30) NOT NULL,
	"rating" int NOT NULL,
	"review" text NOT NULL,
	"time" timestamp NOT NULL,
  
  FOREIGN KEY ("item_id") REFERENCES "items"("id"),
  FOREIGN KEY ("user_email") REFERENCES "users"("email")
);

CREATE TABLE IF NOT EXISTS "pictures" (
	"id" int PRIMARY KEY,
	"item_id" int NOT NULL,
  
  FOREIGN KEY ("item_id") REFERENCES "items"("id")
);

CREATE TABLE IF NOT EXISTS "specials" (
	"item_id" int PRIMARY KEY,
	"end_date" date NOT NULL,
	"end_time" time NOT NULL,
	"price" money NOT NULL,
  
  FOREIGN KEY ("item_id") REFERENCES "items"("id")
);

CREATE TABLE IF NOT EXISTS "purchases" (
	"id" int PRIMARY KEY,
	"user_email" int NOT NULL,
	"timestamp" timestamp NOT NULL,
	"delivery_address_id" int NOT NULL,
  
  FOREIGN KEY ("delivery_address_id") REFERENCES "addresses"("id")
);

CREATE TABLE IF NOT EXISTS "item_purchases" (
	"item_id" int NOT NULL,
	"purchase_id" int NOT NULL,
  
  FOREIGN KEY ("item_id") REFERENCES "items"("id"),
  FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id"),
  
	PRIMARY KEY ("item_id", "purchase_id")
);