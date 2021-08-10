


function returnInitialObject(address_1, address_2, address_3, address_4, address_5, address_6, address_7){
    return {
        "PublicPoolProxyAddress": address_1,
        "TreasuryProxyAddress": address_2,
        "CertisTokenProxyAddress": address_3,
        "PrivatePoolFactoryProxyAddress": address_4,
        "PrivateCertificatePoolImplAddress": address_5,
        "ProviderFactoryProxyAddress": address_6,
        "ProviderImplAddress": address_7
    };  
}

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
            "NewPTreasuryData":  data_2,
            "NewCertisTokenData": data_3,
            "NewPrivatePoolFactoryData": data_4,
            "NewProviderFactoryData":  data_5
        };  
}

exports.returnInitialObject = returnInitialObject;
exports.returnUpgradeObject = returnUpgradeObject;