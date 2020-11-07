const BasicModel = require('../models/basic');
const basicView = require('../views/basic');

const basicModel = new BasicModel();

module.exports = {
	getItems: async function (tableName) {
		try {
			const rows = await basicModel.getItems(tableName);
			basicView.showItems(rows);
			return rows;
		} catch (err) {
			console.log(err);
		}
	},

	insertItem: async function (tableName, itemColumns, itemValues) {
		try {
			await basicModel.insertItem(tableName, itemColumns, itemValues);
			basicView.itemStored();
		} catch (err) {
			console.log(err);
		}
	},

	updateItems: async function (tableName, updatedItem, itemId) {
		try {
			await basicModel.updateItem(tableName, updatedItem, itemId);
			basicView.itemUpdated(tableName, updatedItem);
		} catch (err) {
			console.log(err);
		}
	},

	deleteItem: async function (tableName, itemId) {
		try {
			await basicModel.deleteItem(tableName, itemId);
			basicView.itemDeletion(tableName, itemId);
		} catch (err) {
			console.log(err);
		}
	},

	getTableNames: async function () {
		try {
			return await basicModel.getAllTableNames();
		} catch (err) {
			console.log(err);
		}
	},

	getTableColumns: async function (tableName) {
		try {
			return await basicModel.getAllTableColumns(tableName);
		} catch (err) {
			console.log(err);
		}
	},

	getColumnType: async function (tableName, columnName) {
		try {
			return await basicModel.getColumnType(tableName, columnName);
		} catch (err) {
			console.log(err);
		}
	},

	getNumOfColumns: async function (tableName) {
		try {
			return await basicModel.getNumOfColumns(tableName);
		} catch (err) {
			console.log(err);
		}
	},

	getItem: async function (tableName, itemId) {
		try {
			return await basicModel.getItem(tableName, itemId);
		} catch (err) {
			console.log(err);
		}
	},

	listOfFk: async function (tableName) {
		try {
			return await basicModel.listOfFk(tableName);
		} catch (err) {
			console.log(err);
		}
	},

	checkForParent: async function (tableName, itemId) {
		try {
			return await basicModel.checkForParent(tableName, itemId);
		} catch (err) {
			console.log(err);
		}
	},

	autogenerateNews: async function (num) {
		try {
			await basicModel.autogenerateNews(num);
		} catch (err) {
			console.log(err);
		}
	},

	autogenerateAuthors: async function (num) {
		try {
			await basicModel.autogenerateAuthors(num);
		} catch (err) {
			console.log(err);
		}
	},

	autogenerateCategories: async function (num) {
		try {
			await basicModel.autogenerateCategories(num);
		} catch (err) {
			console.log(err);
		}
	},

	searchFirstReq: async function (itemName, itemAge, itemTitle) {
		try {
			const rows = await basicModel.searchFirstReq(
				itemName,
				itemAge,
				itemTitle
			);
			basicView.showItems(rows);
			return rows;
		} catch (err) {
			console.log(err);
		}
	},

	searchSecondReq: async function (itemId, itemName, itemDate) {
		try {
			const rows = await basicModel.searchSecondReq(
				itemId,
				itemName,
				itemDate
			);
			basicView.showItems(rows);
			return rows;
		} catch (err) {
			console.log(err);
		}
	},

	searchThirdReq: async function (newsId, authorId, categoryName) {
		try {
			const rows = await basicModel.searchThirdReq(
				newsId,
				authorId,
				categoryName
			);
			basicView.showItems(rows);
			return rows;
		} catch (err) {
			console.log(err);
		}
	},

	checkOnSubordinates: async function (
		subordinateTableName,
		foreignKeyField,
		itemId
	) {
		try {
			return await basicModel.checkOnSubordinates(
				subordinateTableName,
				foreignKeyField,
				itemId
			);
		} catch (err) {
			console.log(err);
		}
	},

	end: async function () {
		try {
			await basicModel.end();
		} catch (err) {
			console.log(err);
		}
	},

	basicModel,
};
