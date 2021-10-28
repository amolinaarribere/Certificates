function returnUpgradeObject(address_1, address_2, address_3, address_4, address_5, address_6, address_7, address_8, address_9, address_10,
    data_1, data_2, data_3, data_4, data_5, data_6, data_7, data_8, name_1, version_1){
        return {
            "NewPublicPoolAddress": address_1,
            "NewTreasuryAddress": address_2,
            "NewCertisTokenAddress": address_3,
            "NewPrivatePoolFactoryAddress": address_4,
            "NewPrivatePoolAddress": address_5,
            "NewProviderFactoryAddress": address_6,
            "NewProviderAddress": address_7,
            "NewPriceConverterAddress": address_8,
            "NewPropositionSettingsAddress": address_9,
            "NewENSAddress": address_10,
            "NewPublicPoolData": data_1,
            "NewTreasuryData":  data_2,
            "NewCertisTokenData": data_3,
            "NewPrivatePoolFactoryData": data_4,
            "NewProviderFactoryData":  data_5,
            "NewPriceConverterData":  data_6,
            "NewPropositionSettingsData":  data_7,
            "NewENSData":  data_8,
            "NewPrivatePoolContractName": name_1,
            "NewPrivatePoolContractVersion": version_1
        };  
}

exports.returnUpgradeObject = returnUpgradeObject;