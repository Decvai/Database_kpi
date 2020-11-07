const Readline = require('readline-promises');
const basicController = require('./controllers/basic');

const readline = new Readline();

execute();

async function execute() {
	while (true) {
		console.log(
			`List of commands: create, read, update, delete, autogeneration, search, exit`
		);
		const input = await readline.Question('Enter command: ');
		if (input === 'read') {
			const tableNames = await basicController.getTableNames();
			let hasName = false;
			while (!hasName) {
				const tableName = await readline.Question('Enter table name: ');
				for (const tName in tableNames) {
					if (tableNames[tName].table_name === tableName) {
						hasName = true;
						await basicController.getItems(tableName);
						break;
					}
				}
				if (!hasName) console.log(`This name is missing`);
			}
		} else if (input === 'create') {
			const tableNames = await basicController.getTableNames();
			let hasName = false;
			while (!hasName) {
				const tableName = await readline.Question('Enter table name: ');
				for (const tName in tableNames) {
					if (tableNames[tName].table_name === tableName) {
						hasName = true;
						const tableColumns = await basicController.getTableColumns(
							tableName
						);
						const tableValues = [];
						for (const col in tableColumns) {
							if (tableColumns[col].column !== 'id') {
								while (true) {
									const columnType = await basicController.getColumnType(
										tableName,
										tableColumns[col].column
									);
									const columnValue = await readline.Question(
										`Enter ${tableColumns[col].column}: `
									);

									const fkList = await basicController.listOfFk(
										tableName
									);
									const fkIndex = fkList.findIndex(
										(fk) =>
											fk['column_name'] ===
											tableColumns[col].column
									);
									if (fkIndex !== -1) {
										const isNum = /^\d+$/.test(columnValue);
										if (isNum) {
											const hasParent = await basicController.checkForParent(
												fkList[fkIndex]
													.foreign_table_name,
												columnValue
											);
											if (hasParent === 0) {
												console.log(
													'This FK points to nothing'
												);
												continue;
											}
										} else {
											console.log(`This isn't an index`);
											continue;
										}
									}

									if (
										columnType[0].data_type ===
										'character varying'
									) {
										const isNum = /^\d+$/.test(columnValue);
										if (!isNum) {
											tableValues.push(columnValue);
											break;
										} else {
											console.log(
												`Enter the appropriate type`
											);
											continue;
										}
									} else if (
										columnType[0].data_type === 'integer'
									) {
										const isNum = /^\d+$/.test(columnValue);
										if (isNum) {
											tableValues.push(columnValue);
											break;
										} else {
											console.log(
												`Enter the appropriate type`
											);
											continue;
										}
									} else {
										//**********/
										// console.log(
										// 	`This type unimplemented, try to input smh else...`
										// );
										tableValues.push(columnValue);
										break;
									}
								}
							}
						}
						const [, ...arrColumns] = tableColumns;
						const columns = arrColumns.map((col) => col.column);
						await basicController.insertItem(
							tableName,
							columns,
							tableValues
						);
						break;
					}
				}
				if (!hasName) console.log(`This name is missing`);
			}
		} else if (input === 'update') {
			const tableNames = await basicController.getTableNames();
			let hasName = false;
			while (!hasName) {
				const tableName = await readline.Question('Enter table name: ');
				for (const tName in tableNames) {
					if (tableNames[tName].table_name === tableName) {
						hasName = true;
						const tableItems = await basicController.getItems(
							tableName
						);
						const tableItemsId = tableItems.map((item) => item.id);
						while (true) {
							const enteredId = await readline.Question(
								'Enter id: '
							);
							if (tableItemsId.indexOf(+enteredId) !== -1) {
								const item = await basicController.getItem(
									tableName,
									enteredId
								);
								const itemColumns = await basicController.getTableColumns(
									tableName
								);
								console.log(
									`Enter new values or press 'enter' to keep the default`
								);

								for (const col of itemColumns) {
									if (col.column !== 'id')
										while (true) {
											item[col.column] =
												(await readline.Question(
													`Enter ${col.column}: `
												)) || item[col.column];

											const columnType = await basicController.getColumnType(
												tableName,
												col.column
											);
											if (
												columnType[0].data_type ===
												'character varying'
											) {
												const isNum = /^\d+$/.test(
													item[col.column]
												);
												if (!isNum) break;
												else
													console.log(
														`Enter the appropriate type`
													);
											} else if (
												columnType[0].data_type ===
												'integer'
											) {
												const isNum = /^\d+$/.test(
													item[col.column]
												);
												if (isNum) break;
												else
													console.log(
														`Enter the appropriate type`
													);
											} else {
												console.log(
													`This type unimplemented, try to input smh else...`
												);
												break;
											}
										}
								}

								console.log(item);
								await basicController.updateItems(
									tableName,
									item,
									enteredId
								);
								break;
							}
							console.log(`This ID is missing`);
						}
						break;
					}
				}
				if (!hasName) console.log(`This name is missing`);
			}
		} else if (input === 'delete') {
			const tableNames = await basicController.getTableNames();
			let hasName = false;
			while (!hasName) {
				const tableName = await readline.Question('Enter table name: ');
				for (const tName in tableNames) {
					if (tableNames[tName].table_name === tableName) {
						hasName = true;
						const tableItems = await basicController.getItems(
							tableName
						);
						const tableItemsId = tableItems.map((item) => item.id);
						while (true) {
							const enteredId = await readline.Question(
								'Enter id: '
							);
							if (tableItemsId.indexOf(+enteredId) !== -1) {
								let subordinateTableName, foreignKeyField;
								if (tableName === 'authors') {
									//?hmmm
									subordinateTableName = 'news';
									foreignKeyField = 'author_id';
									const numOfSubordinates = await basicController.checkOnSubordinates(
										subordinateTableName,
										foreignKeyField,
										enteredId
									);
									if (numOfSubordinates === 1) {
										console.log(
											`Subordinates have FK on this id`
										);
										continue;
									}
								}
								await basicController.deleteItem(
									tableName,
									enteredId
								);
								break;
							}
							console.log(`This ID is missing`);
						}

						break;
					}
				}
				if (!hasName) console.log(`This name is missing`);
			}
		} else if (input === 'autogeneration') {
			const tableNames = await basicController.getTableNames();
			let hasName = false;
			while (!hasName) {
				const tableName = await readline.Question('Enter table name: ');
				for (const tName in tableNames) {
					if (tableNames[tName].table_name === tableName) {
						hasName = true;
						const num = await readline.Question(
							'Enter number of records: '
						);
						if (tableName === 'news')
							await basicController.autogenerateNews(num);
						else if (tableName === 'authors')
							await basicController.autogenerateAuthors(num);
						else if (tableName === 'categories')
							await basicController.autogenerateCategories(num);
						break;
					}
				}
				if (!hasName) console.log(`This name is missing`);
			}
		} else if (input === 'search') {
			while (true) {
				const reqNumber = await readline.Question(
					'Enter the request number: '
				);
				if (reqNumber === '1') {
					const itemName = await readline.Question(
						`Enter author's name: `
					);
					const enteredAge = await readline.Question(
						`Enter author's age span(e.g. 4-29): `
					);
					const itemAge = {};
					[itemAge.lower, itemAge.upper] = enteredAge.split('-');
					const itemTitle = await readline.Question(
						`Enter news title: `
					);
					const timeBeforeReq = Date.now();
					await basicController.searchFirstReq(
						itemName,
						itemAge,
						itemTitle
					);
					const timeAfterReq = Date.now();
					console.log(
						`Time taken: ${timeAfterReq - timeBeforeReq}ms`
					);
					break;
				} else if (reqNumber === '2') {
					const enteredItemId = await readline.Question(
						`Enter news id span(e.g. 4-29): `
					);
					const itemId = {};
					[itemId.lower, itemId.upper] = enteredItemId.split('-');
					const itemName = await readline.Question(
						`Enter category name: `
					);
					const enteredItemDate = await readline.Question(
						`Enter news publication date span(e.g. 2010-10-10/2019-05-11): `
					);
					const itemDate = {};
					[itemDate.lower, itemDate.upper] = enteredItemDate.split(
						'/'
					);

					const timeBeforeReq = Date.now();
					await basicController.searchSecondReq(
						itemId,
						itemName,
						itemDate
					);
					const timeAfterReq = Date.now();
					console.log(
						`Time taken: ${timeAfterReq - timeBeforeReq}ms`
					);
					break;
				} else if (reqNumber === '3') {
					const enteredNewsId = await readline.Question(
						`Enter news id span(e.g. 4-29): `
					);
					const newsId = {};
					[newsId.lower, newsId.upper] = enteredNewsId.split('-');
					const enteredAuthorId = await readline.Question(
						`Enter author id span(e.g. 4-29): `
					);
					const authorId = {};
					[authorId.lower, authorId.upper] = enteredAuthorId.split(
						'-'
					);
					const categoryName = await readline.Question(
						`Enter category name: `
					);

					const timeBeforeReq = Date.now();
					await basicController.searchThirdReq(
						newsId,
						authorId,
						categoryName
					);
					const timeAfterReq = Date.now();
					console.log(
						`Time taken: ${timeAfterReq - timeBeforeReq}ms`
					);
					break;
				} else console.log(`Sorry, but only 3 possible requests.`);
			}
		} else if (input === 'exit') {
			await basicController.end();
			break;
		} else console.log(`You've entered an unimplemented command.`);
		console.log('\n');
	}
}
