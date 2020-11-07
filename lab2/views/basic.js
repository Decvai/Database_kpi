module.exports = {
	showItems: function (items) {
		console.table(items);
	},
	itemDeletion: function (tableName, itemId) {
		console.log(
			'--------------------------------------------------------------'
		);
		console.log(`We have just removed ${itemId} id from ${tableName}`);
		console.log(
			'--------------------------------------------------------------'
		);
	},
	itemUpdated: function (tableName, updatedItem) {
		const itemKeys = Object.keys(updatedItem);
		const itemValues = Object.values(updatedItem);

		console.log(
			'---   ---   ---   ---   ---   ---   ---   ---   ---   ---   --'
		);
		for (let i = 0; i < itemKeys.length; i++) {
			if (itemKeys[i] !== 'id')
				console.log(
					`Change ${tableName} ${itemKeys[i]} --> ${itemValues[i]}`
				);
		}
		console.log(
			'---   ---   ---   ---   ---   ---   ---   ---   ---   ---   --'
		);
	},
	itemStored: function () {
		console.log(
			'++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++'
		);
		console.log(`Item was added`);
		console.log(
			'++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++'
		);
	},
};
