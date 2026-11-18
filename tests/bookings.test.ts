// tests/bookings.test.ts
import request from "supertest";
import { it, expect } from "vitest";
import { app } from "../src/app"; // l'app, sans app.listen()
it("Léa réserve 2 places en gradin", async () => {
  const res = await request(app).post("/concerts/3/bookings").send({
    email: "lea@mail.fr",
    tickets: [{ category: "GRADIN", quantity: 2 }]
  });
  expect(res.status).toBe(201);
  expect(res.body.total).toBe(89.52); // la photo
});

it("Alexis, étudiant, réserve 2 places en gradin", async() => {
  const res = await request(app).post("/concerts/3/bookings").send({
    email: "alexis@mail.fr",
    tickets: [{category: "GRADIN", quantity: 2}],
    student: true,
  });

  expect(res.status).toBe(201);
  expect(res.body.total).toBe(72.22);


});

it("Une classe reserve 8 places pour les gradins", async() => {
  const res = await request(app).post("/concerts/3/bookings").send({
    email: "charly@mail.fr",
    tickets: [{category: "GRADIN", quantity: 8}],
  });

  expect(res.status).toBe(201);
  expect(res.body.total).toBe(334.20);


});


it("Alice passe de la fosse au gradin", async () => {
  const res = await request(app).post("/bookings/1/change-category").send({
    email: "alice@mail.fr",
    category: "GRADIN",
  });
  expect(res.status).toBe(200);
  expect(res.body.total).toBe(126.6);
});

