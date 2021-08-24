function returnUpgradeObject(address_1, address_2, address_3, address_4, address_5, address_6, address_7, 
    data_1, data_2, data_3, data_4, data_5){
        return {
            "NewPublicPoolAddress": address_1,
            "NewTreasuryAddress": address_2,
            "NewCertisTokenAddress": address_3,
            "NewPrivatePoolFactoryAddress": address_4,
            "NewPrivatePoolAddress": address_5,
            "NewProviderFactoryAddress": address_6,
            "NewProviderAddress": address_7,
            "NewPublicPoolData": data_1,
            "NewTreasuryData":  data_2,
            "NewCertisTokenData": data_3,
            "NewPrivatePoolFactoryData": data_4,
            "NewProviderFactoryData":  data_5
        };  
}

exports.returnUpgradeObject = returnUpgradeObject;