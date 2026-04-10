'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            // Define associations HERE - will be called later
            User.hasMany(models.Complaint, {
                foreignKey: 'userId',
                as: 'complaints'
            });
        }

        static async hashPassword(user) {
            const bcrypt = require('bcryptjs');
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }

    User.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        mobile: {
            type: DataTypes.STRING(10),
            unique: true,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        location: {
            type: DataTypes.STRING(255)
        },
        role: {
            type: DataTypes.ENUM('admin', 'user'),
            defaultValue: 'user'
        }
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'Users',
        hooks: {
            beforeCreate: User.hashPassword,
            beforeUpdate: User.hashPassword
        }
    });

    User.associate = (models) => {
        User.hasMany(models.Complaint, {
            foreignKey: {
                name: "userId",
                allowNull: false
            },
            onDelete: "CASCADE"
        });
    };

    return User;
};
