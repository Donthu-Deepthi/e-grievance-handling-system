'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class Complaint extends Model {
        static associate(models) {
            Complaint.belongsTo(models.User, {
                foreignKey: {
                    name: "userId",
                    allowNull: false
                },
                onDelete: "CASCADE"
            });
        }
    }

    Complaint.init({

        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        location: {
            type: DataTypes.STRING(255),
            allowNull: false
        },

        category: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        status: {
            type: DataTypes.STRING(50),
            defaultValue: "pending"
        },

        image_url: {
            type: DataTypes.STRING(255)
        },

        // ⭐ THIS WAS MISSING
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }

    }, {
        sequelize,
        modelName: "Complaint",
        tableName: "Complaints"
    });

    return Complaint;
};