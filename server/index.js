const express = require("express");
const {
    client,
    createTables,  
    createProduct,
    createUser,
    fetchUsers,
    fetchProducts,
    createFavorite,
    fetchFavorites,
    destroyFavorite
} = require("./db");

//create the express server
const server = express();

//middleware to use before all routes
server.use(express.json()); 

//routes
//returns an array of users
server.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (ex) {
    next(ex);
  }
});

//returns an array of products
server.get("/api/products", async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  } catch (ex) {
    next(ex);
  }
});

//returns an array of a particular user's favorites
server.get("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.send(await fetchFavorites({ user_id: req.params.id }));
  } catch (ex) {
    next(ex);
  }
});

//adds a favorite to a particular user
server.post("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.status(201).send(
      await createFavorite({
        user_id: req.params.id,
        product_id: req.body.product_id,
      })
    );
  } catch (ex) {
    next(ex);
  }
});

//deletes a particular user's favorite
server.delete("/api/users/:userId/favorites/:id", async (req, res, next) => {
  try {
    await destroyFavorite({ id: req.params.id, user_id: req.params.userId });
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

//error handling route which returns an object with an error property
server.use((err, req, res, next) => {
  res.status(err.status || 500).send({ error: err.message || err });
});


const init = async () => {
    await client.connect();
  
    await createTables();
    console.log("create tables");
  
    const [kiki, ghage, kianna] = await Promise.all([
      createUser({ username: "Kiki", password: "IloveTreats" }),
      createUser({ username: "Ghage", password: "EldenRing" }),
      createUser({ username: "Kianna", password: "password123" }),
    ]);
  
    console.log(await fetchUsers());
    console.log("Seeded users");
  
    const [treats, games, nikon] = await Promise.all([
      createProduct({ name: "Treats" }),
      createProduct({ name: "Games" }),
      createProduct({ name: "Nikon" }),
    ]);
  
    console.log(await fetchProducts());
    console.log("Seeded products");
  
    const [fav1, fav2, fav3] = await Promise.all([
      createFavorite({ user_id: kiki.id, product_id: treats.id }),
      createFavorite({ user_id: ghage.id, product_id: games.id }),
      createFavorite({ user_id: kianna.id, product_id: nikon.id }),
    ]);
  
    console.log("Kiki favorite", await fetchFavorites({ user_id: kiki.id }));
    console.log("Seeded favorites");
  
    await destroyFavorite({ id: fav2.id, user_id: ghage.id });
  
    console.log("Ghage Favorites", await fetchFavorites({ user_id: ghage.id }));
  
    // await client.end();

    const port = process.env.PORT || 3000;
    server.listen(port, () => console.log(`listening on port ${port}`));
  };
  
  init();




