const Sequelize = require("sequelize");

/**
 * Actions summary:
 *
 * createTable() => "Users", deps: []
 * createTable() => "Restaurants", deps: []
 * createTable() => "UserLikes", deps: []
 * createTable() => "DishInOrders", deps: []
 * createTable() => "Dishes", deps: [Restaurants]
 * createTable() => "Orders", deps: [Restaurants, Users]
 * createTable() => "Order_Dish", deps: [Dishes, Orders]
 *
 */

const info = {
  revision: 1,
  name: "add-users-table",
  created: "2022-12-08T21:57:54.484Z",
  comment: "",
};

const migrationCommands = (transaction) => [
  {
    fn: "createTable",
    params: [
      "Users",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        email: { type: Sequelize.STRING, field: "email", allowNull: false },
        password: {
          type: Sequelize.STRING,
          field: "password",
          allowNull: false,
        },
        role: {
          type: Sequelize.STRING,
          field: "role",
          defaultValue: false,
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "Restaurants",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        name: { type: Sequelize.STRING, field: "name", allowNull: false },
        address: { type: Sequelize.STRING, field: "address", allowNull: false },
        previewLink: {
          type: Sequelize.STRING,
          field: "previewLink",
          allowNull: false,
        },
        type: { type: Sequelize.STRING, field: "type", allowNull: false },
        likes: {
          type: Sequelize.INTEGER,
          field: "likes",
          defaultValue: 0,
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "UserLikes",
      {
        userId: { type: Sequelize.INTEGER, field: "userId", allowNull: false },
        restaurantId: {
          type: Sequelize.INTEGER,
          field: "restaurantId",
          allowNull: false,
        },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "DishInOrders",
      {
        dishId: { type: Sequelize.INTEGER, field: "dishId", allowNull: false },
        orderId: {
          type: Sequelize.INTEGER,
          field: "orderId",
          allowNull: false,
        },
        amount: { type: Sequelize.INTEGER, field: "amount", allowNull: false },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "Dishes",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        name: { type: Sequelize.STRING, field: "name", allowNull: false },
        description: {
          type: Sequelize.STRING,
          field: "description",
          allowNull: false,
        },
        previewLink: {
          type: Sequelize.STRING,
          field: "previewLink",
          allowNull: false,
        },
        cost: { type: Sequelize.STRING, field: "cost", allowNull: false },
        restaurantId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: { model: "Restaurants", key: "id" },
          field: "restaurantId",
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "Orders",
      {
        id: {
          type: Sequelize.INTEGER,
          field: "id",
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        restaurantId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          references: { model: "Restaurants", key: "id" },
          field: "restaurantId",
          allowNull: false,
        },
        userId: {
          type: Sequelize.INTEGER,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: { model: "Users", key: "id" },
          field: "userId",
          allowNull: false,
        },
        totalCost: {
          type: Sequelize.STRING,
          field: "totalCost",
          allowNull: false,
        },
        isPaid: {
          type: Sequelize.BOOLEAN,
          field: "isPaid",
          defaultValue: false,
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "Order_Dish",
      {
        createdAt: {
          type: Sequelize.DATE,
          field: "createdAt",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updatedAt",
          allowNull: false,
        },
        DishId: {
          type: Sequelize.INTEGER,
          field: "DishId",
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: { model: "Dishes", key: "id" },
          primaryKey: true,
        },
        OrderId: {
          type: Sequelize.INTEGER,
          field: "OrderId",
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          references: { model: "Orders", key: "id" },
          primaryKey: true,
        },
      },
      { transaction },
    ],
  },
];

const rollbackCommands = (transaction) => [
  {
    fn: "dropTable",
    params: ["Users", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["Restaurants", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["Dishes", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["Orders", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["UserLikes", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["DishInOrders", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["Order_Dish", { transaction }],
  },
];

const pos = 0;
const useTransaction = true;

const execute = (queryInterface, sequelize, _commands) => {
  let index = pos;
  const run = (transaction) => {
    const commands = _commands(transaction);
    return new Promise((resolve, reject) => {
      const next = () => {
        if (index < commands.length) {
          const command = commands[index];
          console.log(`[#${index}] execute: ${command.fn}`);
          index++;
          queryInterface[command.fn](...command.params).then(next, reject);
        } else resolve();
      };
      next();
    });
  };
  if (useTransaction) return queryInterface.sequelize.transaction(run);
  return run(null);
};

module.exports = {
  pos,
  useTransaction,
  up: (queryInterface, sequelize) =>
    execute(queryInterface, sequelize, migrationCommands),
  down: (queryInterface, sequelize) =>
    execute(queryInterface, sequelize, rollbackCommands),
  info,
};
