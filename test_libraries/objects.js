function returnUpgradeObject(address_1, address_2, address_3, address_4, address_5, address_6, address_7, address_8, address_9, address_10,
    data_1, data_2, data_3, data_4, data_5, data_6, data_7, data_8, name_1, version_1){
        return {
            "TransparentAddresses": [address_1, address_2, address_3, address_4, address_6, address_8, address_9, address_10],
            "BeaconAddresses": [address_5, address_7],
            "TransparentData": [data_1, data_2, data_3, data_4, data_5, data_6, data_7, data_8],
            "PrivatePoolContractName": name_1,
            "PrivatePoolContractVersion": version_1
        };  
}

exports.returnUpgradeObject = returnUpgradeObject;