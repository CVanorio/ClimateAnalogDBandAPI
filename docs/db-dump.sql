-- MySQL dump 10.13  Distrib 8.0.37, for Win64 (x86_64)
--
-- Host: wwwtest.climatology.nelson.wisc.edu    Database: climate-change-app
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Counties`
--

DROP TABLE IF EXISTS `Counties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Counties` (
  `CountyID` int NOT NULL AUTO_INCREMENT,
  `CountyCode` varchar(3) NOT NULL,
  `CountyName` varchar(100) NOT NULL,
  `StateCode` varchar(2) NOT NULL,
  `Latitude` decimal(8,6) NOT NULL,
  `Longitude` decimal(9,6) NOT NULL,
  PRIMARY KEY (`CountyID`),
  KEY `StateCode` (`StateCode`),
  CONSTRAINT `Counties_ibfk_1` FOREIGN KEY (`StateCode`) REFERENCES `States` (`StateCode`)
) ENGINE=InnoDB AUTO_INCREMENT=3138 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PhysicalDistances`
--

DROP TABLE IF EXISTS `PhysicalDistances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PhysicalDistances` (
  `TargetCountyId` int NOT NULL,
  `AnalogCountyId` int NOT NULL,
  `PhysicalDistance` decimal(8,6) DEFAULT NULL,
  PRIMARY KEY (`TargetCountyId`,`AnalogCountyId`),
  KEY `AnalogCountyId` (`AnalogCountyId`),
  CONSTRAINT `PhysicalDistances_ibfk_1` FOREIGN KEY (`TargetCountyId`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `PhysicalDistances_ibfk_2` FOREIGN KEY (`AnalogCountyId`) REFERENCES `Counties` (`CountyID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `States`
--

DROP TABLE IF EXISTS `States`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `States` (
  `StateCode` varchar(2) NOT NULL,
  `StateAbbr` varchar(2) NOT NULL,
  `StateName` varchar(100) NOT NULL,
  PRIMARY KEY (`StateCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `WICountyMonthlyPrecip_TEMP`
--

DROP TABLE IF EXISTS `WICountyMonthlyPrecip_TEMP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `WICountyMonthlyPrecip_TEMP` (
  `CountyID` int DEFAULT NULL,
  `Year` int DEFAULT NULL,
  `Month` char(2) DEFAULT NULL,
  `Precipitation` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `WICountyMonthlyTemp_TEMP`
--

DROP TABLE IF EXISTS `WICountyMonthlyTemp_TEMP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `WICountyMonthlyTemp_TEMP` (
  `CountyID` int DEFAULT NULL,
  `Year` int DEFAULT NULL,
  `Month` char(2) DEFAULT NULL,
  `Temperature` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `WICountySeasonalPrecip_TEMP`
--

DROP TABLE IF EXISTS `WICountySeasonalPrecip_TEMP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `WICountySeasonalPrecip_TEMP` (
  `CountyID` int DEFAULT NULL,
  `Year` int DEFAULT NULL,
  `Season` varchar(10) DEFAULT NULL,
  `Precipitation` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `WICountySeasonalTemp_TEMP`
--

DROP TABLE IF EXISTS `WICountySeasonalTemp_TEMP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `WICountySeasonalTemp_TEMP` (
  `CountyID` int DEFAULT NULL,
  `Year` int DEFAULT NULL,
  `Season` varchar(10) DEFAULT NULL,
  `Temperature` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `WICountyYearlyPrecip_TEMP`
--

DROP TABLE IF EXISTS `WICountyYearlyPrecip_TEMP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `WICountyYearlyPrecip_TEMP` (
  `CountyID` int DEFAULT NULL,
  `Year` int DEFAULT NULL,
  `Precipitation` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `WICountyYearlyTemp_TEMP`
--

DROP TABLE IF EXISTS `WICountyYearlyTemp_TEMP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `WICountyYearlyTemp_TEMP` (
  `CountyID` int DEFAULT NULL,
  `Year` int DEFAULT NULL,
  `Temperature` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `monthly_combined_distances`
--

DROP TABLE IF EXISTS `monthly_combined_distances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monthly_combined_distances` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Month` varchar(2) NOT NULL,
  `Distance` decimal(6,2) DEFAULT NULL,
  `AnalogRank` int DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`,`Month`),
  KEY `AnalogCountyID` (`AnalogCountyID`),
  CONSTRAINT `monthly_combined_distances_ibfk_1` FOREIGN KEY (`TargetCountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `monthly_combined_distances_ibfk_2` FOREIGN KEY (`AnalogCountyID`) REFERENCES `Counties` (`CountyID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `monthly_precipitation_data_wi`
--

DROP TABLE IF EXISTS `monthly_precipitation_data_wi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monthly_precipitation_data_wi` (
  `CountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Month` varchar(2) NOT NULL,
  `Precipitation` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`CountyID`,`Year`,`Month`),
  CONSTRAINT `monthly_precipitation_data_wi_ibfk_1` FOREIGN KEY (`CountyID`) REFERENCES `Counties` (`CountyID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `monthly_precipitation_distances`
--

DROP TABLE IF EXISTS `monthly_precipitation_distances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monthly_precipitation_distances` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Month` varchar(2) NOT NULL,
  `Distance` decimal(6,2) DEFAULT NULL,
  `AnalogRank` int DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`,`Month`),
  KEY `AnalogCountyID` (`AnalogCountyID`),
  CONSTRAINT `monthly_precipitation_distances_ibfk_1` FOREIGN KEY (`TargetCountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `monthly_precipitation_distances_ibfk_2` FOREIGN KEY (`AnalogCountyID`) REFERENCES `Counties` (`CountyID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `monthly_precipitation_distances_TEMP`
--

DROP TABLE IF EXISTS `monthly_precipitation_distances_TEMP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monthly_precipitation_distances_TEMP` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Month` varchar(2) NOT NULL,
  `Distance` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`,`Month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `monthly_precipitation_norms`
--

DROP TABLE IF EXISTS `monthly_precipitation_norms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monthly_precipitation_norms` (
  `CountyID` int NOT NULL,
  `Month` varchar(2) NOT NULL,
  `NormPrecipitation` decimal(5,2) NOT NULL,
  `StdDevPrecipitation` decimal(5,2) NOT NULL,
  PRIMARY KEY (`CountyID`,`Month`),
  CONSTRAINT `monthly_precipitation_norms_ibfk_1` FOREIGN KEY (`CountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `chk_monthly_precip_stddev_pos` CHECK ((`StdDevPrecipitation` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `monthly_temperature_data_wi`
--

DROP TABLE IF EXISTS `monthly_temperature_data_wi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monthly_temperature_data_wi` (
  `CountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Month` varchar(2) NOT NULL,
  `Temperature` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`CountyID`,`Year`,`Month`),
  CONSTRAINT `monthly_temperature_data_wi_ibfk_1` FOREIGN KEY (`CountyID`) REFERENCES `Counties` (`CountyID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `monthly_temperature_distances`
--

DROP TABLE IF EXISTS `monthly_temperature_distances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monthly_temperature_distances` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Month` varchar(2) NOT NULL,
  `Distance` decimal(6,2) DEFAULT NULL,
  `AnalogRank` int DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`,`Month`),
  KEY `AnalogCountyID` (`AnalogCountyID`),
  CONSTRAINT `monthly_temperature_distances_ibfk_1` FOREIGN KEY (`TargetCountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `monthly_temperature_distances_ibfk_2` FOREIGN KEY (`AnalogCountyID`) REFERENCES `Counties` (`CountyID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `monthly_temperature_distances_TEMP`
--

DROP TABLE IF EXISTS `monthly_temperature_distances_TEMP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monthly_temperature_distances_TEMP` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Month` varchar(2) NOT NULL,
  `Distance` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`,`Month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `monthly_temperature_norms`
--

DROP TABLE IF EXISTS `monthly_temperature_norms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monthly_temperature_norms` (
  `CountyID` int NOT NULL,
  `Month` varchar(2) NOT NULL,
  `NormTemperature` decimal(5,2) NOT NULL,
  `StdDevTemperature` decimal(5,2) NOT NULL,
  PRIMARY KEY (`CountyID`,`Month`),
  CONSTRAINT `monthly_temperature_norms_ibfk_1` FOREIGN KEY (`CountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `chk_monthly_temp_stddev_pos` CHECK ((`StdDevTemperature` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `seasonal_combined_distances`
--

DROP TABLE IF EXISTS `seasonal_combined_distances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seasonal_combined_distances` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Season` varchar(6) NOT NULL,
  `Distance` decimal(5,2) DEFAULT NULL,
  `AnalogRank` int DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`,`Season`),
  KEY `AnalogCountyID` (`AnalogCountyID`),
  CONSTRAINT `seasonal_combined_distances_ibfk_1` FOREIGN KEY (`TargetCountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `seasonal_combined_distances_ibfk_2` FOREIGN KEY (`AnalogCountyID`) REFERENCES `Counties` (`CountyID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `seasonal_precipitation_data_wi`
--

DROP TABLE IF EXISTS `seasonal_precipitation_data_wi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seasonal_precipitation_data_wi` (
  `CountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Season` varchar(6) NOT NULL,
  `Precipitation` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`CountyID`,`Year`,`Season`),
  CONSTRAINT `seasonal_precipitation_data_wi_ibfk_1` FOREIGN KEY (`CountyID`) REFERENCES `Counties` (`CountyID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `seasonal_precipitation_distances`
--

DROP TABLE IF EXISTS `seasonal_precipitation_distances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seasonal_precipitation_distances` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Season` varchar(6) NOT NULL,
  `Distance` decimal(5,2) DEFAULT NULL,
  `AnalogRank` int DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`,`Season`),
  KEY `AnalogCountyID` (`AnalogCountyID`),
  CONSTRAINT `seasonal_precipitation_distances_ibfk_1` FOREIGN KEY (`TargetCountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `seasonal_precipitation_distances_ibfk_2` FOREIGN KEY (`AnalogCountyID`) REFERENCES `Counties` (`CountyID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `seasonal_precipitation_distances_TEMP`
--

DROP TABLE IF EXISTS `seasonal_precipitation_distances_TEMP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seasonal_precipitation_distances_TEMP` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Season` varchar(6) NOT NULL,
  `Distance` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`,`Season`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `seasonal_precipitation_norms`
--

DROP TABLE IF EXISTS `seasonal_precipitation_norms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seasonal_precipitation_norms` (
  `CountyID` int NOT NULL,
  `Season` varchar(6) NOT NULL,
  `NormPrecipitation` decimal(5,2) NOT NULL,
  `StdDevPrecipitation` decimal(5,2) NOT NULL,
  PRIMARY KEY (`CountyID`,`Season`),
  CONSTRAINT `seasonal_precipitation_norms_ibfk_1` FOREIGN KEY (`CountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `chk_seasonal_precip_stddev_pos` CHECK ((`StdDevPrecipitation` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `seasonal_temperature_data_wi`
--

DROP TABLE IF EXISTS `seasonal_temperature_data_wi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seasonal_temperature_data_wi` (
  `CountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Season` varchar(6) NOT NULL,
  `Temperature` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`CountyID`,`Year`,`Season`),
  CONSTRAINT `seasonal_temperature_data_wi_ibfk_1` FOREIGN KEY (`CountyID`) REFERENCES `Counties` (`CountyID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `seasonal_temperature_distances`
--

DROP TABLE IF EXISTS `seasonal_temperature_distances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seasonal_temperature_distances` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Season` varchar(6) NOT NULL,
  `Distance` decimal(5,2) DEFAULT NULL,
  `AnalogRank` int DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`,`Season`),
  KEY `AnalogCountyID` (`AnalogCountyID`),
  CONSTRAINT `seasonal_temperature_distances_ibfk_1` FOREIGN KEY (`TargetCountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `seasonal_temperature_distances_ibfk_2` FOREIGN KEY (`AnalogCountyID`) REFERENCES `Counties` (`CountyID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `seasonal_temperature_distances_TEMP`
--

DROP TABLE IF EXISTS `seasonal_temperature_distances_TEMP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seasonal_temperature_distances_TEMP` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Season` varchar(6) NOT NULL,
  `Distance` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`,`Season`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `seasonal_temperature_norms`
--

DROP TABLE IF EXISTS `seasonal_temperature_norms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seasonal_temperature_norms` (
  `CountyID` int NOT NULL,
  `Season` varchar(6) NOT NULL,
  `NormTemperature` decimal(5,2) NOT NULL,
  `StdDevTemperature` decimal(5,2) NOT NULL,
  PRIMARY KEY (`CountyID`,`Season`),
  CONSTRAINT `seasonal_temperature_norms_ibfk_1` FOREIGN KEY (`CountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `chk_seasonal_temp_stddev_pos` CHECK ((`StdDevTemperature` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `yearly_combined_distances`
--

DROP TABLE IF EXISTS `yearly_combined_distances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `yearly_combined_distances` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Distance` decimal(5,2) DEFAULT NULL,
  `AnalogRank` int DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`),
  KEY `AnalogCountyID` (`AnalogCountyID`),
  CONSTRAINT `yearly_combined_distances_ibfk_1` FOREIGN KEY (`TargetCountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `yearly_combined_distances_ibfk_2` FOREIGN KEY (`AnalogCountyID`) REFERENCES `Counties` (`CountyID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `yearly_precipitation_data_wi`
--

DROP TABLE IF EXISTS `yearly_precipitation_data_wi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `yearly_precipitation_data_wi` (
  `CountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Precipitation` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`CountyID`,`Year`),
  CONSTRAINT `yearly_precipitation_data_wi_ibfk_1` FOREIGN KEY (`CountyID`) REFERENCES `Counties` (`CountyID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `yearly_precipitation_distances`
--

DROP TABLE IF EXISTS `yearly_precipitation_distances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `yearly_precipitation_distances` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Distance` decimal(5,2) DEFAULT NULL,
  `AnalogRank` int DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`),
  KEY `AnalogCountyID` (`AnalogCountyID`),
  CONSTRAINT `yearly_precipitation_distances_ibfk_1` FOREIGN KEY (`TargetCountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `yearly_precipitation_distances_ibfk_2` FOREIGN KEY (`AnalogCountyID`) REFERENCES `Counties` (`CountyID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `yearly_precipitation_distances_TEMP`
--

DROP TABLE IF EXISTS `yearly_precipitation_distances_TEMP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `yearly_precipitation_distances_TEMP` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Distance` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `yearly_precipitation_norms`
--

DROP TABLE IF EXISTS `yearly_precipitation_norms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `yearly_precipitation_norms` (
  `CountyID` int NOT NULL,
  `NormPrecipitation` decimal(5,2) NOT NULL,
  `StdDevPrecipitation` decimal(5,2) NOT NULL,
  PRIMARY KEY (`CountyID`),
  CONSTRAINT `yearly_precipitation_norms_ibfk_1` FOREIGN KEY (`CountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `chk_yearly_precip_stddev_pos` CHECK ((`StdDevPrecipitation` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `yearly_temperature_data_wi`
--

DROP TABLE IF EXISTS `yearly_temperature_data_wi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `yearly_temperature_data_wi` (
  `CountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Temperature` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`CountyID`,`Year`),
  CONSTRAINT `yearly_temperature_data_wi_ibfk_1` FOREIGN KEY (`CountyID`) REFERENCES `Counties` (`CountyID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `yearly_temperature_distances`
--

DROP TABLE IF EXISTS `yearly_temperature_distances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `yearly_temperature_distances` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Distance` decimal(5,2) DEFAULT NULL,
  `AnalogRank` int DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`),
  KEY `AnalogCountyID` (`AnalogCountyID`),
  CONSTRAINT `yearly_temperature_distances_ibfk_1` FOREIGN KEY (`TargetCountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `yearly_temperature_distances_ibfk_2` FOREIGN KEY (`AnalogCountyID`) REFERENCES `Counties` (`CountyID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `yearly_temperature_distances_TEMP`
--

DROP TABLE IF EXISTS `yearly_temperature_distances_TEMP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `yearly_temperature_distances_TEMP` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Distance` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `yearly_temperature_norms`
--

DROP TABLE IF EXISTS `yearly_temperature_norms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `yearly_temperature_norms` (
  `CountyID` int NOT NULL,
  `NormTemperature` decimal(5,2) NOT NULL,
  `StdDevTemperature` decimal(5,2) NOT NULL,
  PRIMARY KEY (`CountyID`),
  CONSTRAINT `yearly_temperature_norms_ibfk_1` FOREIGN KEY (`CountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `chk_yearly_temp_stddev_pos` CHECK ((`StdDevTemperature` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'climate-change-app'
--
/*!50003 DROP PROCEDURE IF EXISTS `CalculateAllMonthlyCombinedDistances` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `CalculateAllMonthlyCombinedDistances`()
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_wiCountyID INT;

    
    DECLARE v_wiCountyCursor CURSOR FOR 
        SELECT DISTINCT TargetCountyID FROM monthly_precipitation_distances_TEMP;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    OPEN v_wiCountyCursor;
    
    county_loop: LOOP
        FETCH v_wiCountyCursor INTO v_wiCountyID;
        
        IF v_done THEN
            LEAVE county_loop;
        END IF;
        
        CALL CalculateMonthlyCombinedDistancesForCounty(v_wiCountyID);
    END LOOP county_loop;

    CLOSE v_wiCountyCursor;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CalculateAllMonthlyDistancesForCounty` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `CalculateAllMonthlyDistancesForCounty`(IN p_targetCountyID INT)
BEGIN
    
    REPLACE INTO monthly_precipitation_distances (TargetCountyID, AnalogCountyID, Year, Month, Distance, AnalogRank)
    SELECT
        p_targetCountyID AS TargetCountyID,
        dc.AnalogCountyID AS AnalogCountyID,
        dc.Year,
        dc.Month,
        dc.Distance,
        RANK() OVER (
            PARTITION BY p_targetCountyID, dc.Year, dc.Month
            ORDER BY dc.Distance ASC, pd.PhysicalDistance ASC
        ) AS AnalogRank
    FROM (
        SELECT
            a.CountyID AS AnalogCountyID,
            t.Year,
            t.Month,
            ROUND(SQRT(POW((a.NormPrecipitation - t.Precipitation), 2) / POW(a.StdDevPrecipitation, 2)), 2) AS Distance
        FROM
            monthly_precipitation_data_wi t
        CROSS JOIN
            monthly_precipitation_norms a
        WHERE
            t.Month = a.Month
            AND t.CountyID = p_targetCountyID
    ) AS dc
    JOIN PhysicalDistances pd
        ON dc.AnalogCountyID = pd.AnalogCountyId
        AND pd.TargetCountyId = p_targetCountyID;

    
    REPLACE INTO monthly_temperature_distances (TargetCountyID, AnalogCountyID, Year, Month, Distance, AnalogRank)
    SELECT
        p_targetCountyID AS TargetCountyID,
        dc.AnalogCountyID AS AnalogCountyID,
        dc.Year,
        dc.Month,
        dc.Distance,
        RANK() OVER (
            PARTITION BY p_targetCountyID, dc.Year, dc.Month
            ORDER BY dc.Distance ASC, pd.PhysicalDistance ASC
        ) AS AnalogRank
    FROM (
        SELECT
            a.CountyID AS AnalogCountyID,
            t.Year,
            t.Month,
            ROUND(SQRT(POW((a.NormTemperature - t.Temperature), 2) / POW(a.StdDevTemperature, 2)), 2) AS Distance
        FROM
            monthly_temperature_data_wi t
        CROSS JOIN
            monthly_temperature_norms a
        WHERE
            t.Month = a.Month
            AND t.CountyID = p_targetCountyID
    ) AS dc
    JOIN PhysicalDistances pd
        ON dc.AnalogCountyID = pd.AnalogCountyId
        AND pd.TargetCountyId = p_targetCountyID;

    
    CREATE TEMPORARY TABLE TempMonthlyCombinedDistances AS
    SELECT
        p.TargetCountyID,
        p.AnalogCountyID,
        p.Year,
        p.Month,
        ROUND(SQRT(POW(p.Distance, 2) + POW(t.Distance, 2)), 2) AS CombinedDistance
    FROM
        monthly_precipitation_distances p
    JOIN monthly_temperature_distances t
        ON p.TargetCountyID = t.TargetCountyID
        AND p.AnalogCountyID = t.AnalogCountyID
        AND p.Year = t.Year
        AND p.Month = t.Month
    WHERE
        p.TargetCountyID = p_targetCountyID;

    CREATE TEMPORARY TABLE TempMonthlyRankedDistances AS
    SELECT
        cd.TargetCountyID,
        cd.AnalogCountyID,
        cd.Year,
        cd.Month,
        cd.CombinedDistance,
        RANK() OVER (
            PARTITION BY cd.TargetCountyID, cd.Year, cd.Month
            ORDER BY cd.CombinedDistance ASC, pd.PhysicalDistance ASC
        ) AS AnalogRank
    FROM
        TempMonthlyCombinedDistances cd
    JOIN PhysicalDistances pd
        ON cd.AnalogCountyID = pd.AnalogCountyId
        AND pd.TargetCountyId = cd.TargetCountyID;

    REPLACE INTO monthly_combined_distances (TargetCountyID, AnalogCountyID, Year, Month, Distance, AnalogRank)
    SELECT
        TargetCountyID,
        AnalogCountyID,
        Year,
        Month,
        CombinedDistance,
        AnalogRank
    FROM
        TempMonthlyRankedDistances
    WHERE
        AnalogRank <= 50;

    
    DROP TEMPORARY TABLE IF EXISTS TempMonthlyCombinedDistances;
    DROP TEMPORARY TABLE IF EXISTS TempMonthlyRankedDistances;

    
    DELETE FROM monthly_precipitation_distances 
    WHERE TargetCountyID = p_targetCountyID AND AnalogRank > 150;

    
    DELETE FROM monthly_temperature_distances 
    WHERE TargetCountyID = p_targetCountyID AND AnalogRank > 150;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CalculateAllMonthlyDistancesForWI` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `CalculateAllMonthlyDistancesForWI`()
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_targetCountyID INT;
    DECLARE v_countyCursor CURSOR FOR 
        SELECT CountyID FROM Counties WHERE StateCode = '47';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    OPEN v_countyCursor;

    
    county_loop: LOOP
        FETCH v_countyCursor INTO v_targetCountyID;

        IF v_done THEN
            LEAVE county_loop;
        END IF;

        
        CALL CalculateAllMonthlyDistancesForCounty(v_targetCountyID);
    END LOOP county_loop;

    CLOSE v_countyCursor;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CalculateAllSeasonalCombinedDistances` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `CalculateAllSeasonalCombinedDistances`()
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_wiCountyID INT;
    DECLARE v_wiCountyCursor CURSOR FOR 
        SELECT DISTINCT TargetCountyID FROM seasonal_precipitation_distances_TEMP;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    OPEN v_wiCountyCursor;
    
    county_loop: LOOP
        FETCH v_wiCountyCursor INTO v_wiCountyID;
        
        IF v_done THEN
            LEAVE county_loop;
        END IF;
        
        CALL CalculateSeasonalCombinedDistancesForCounty(v_wiCountyID);
    END LOOP county_loop;

    CLOSE v_wiCountyCursor;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CalculateAllSeasonalDistancesForCounty` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `CalculateAllSeasonalDistancesForCounty`(IN p_targetCountyID INT)
BEGIN
    
    REPLACE INTO seasonal_precipitation_distances (TargetCountyID, AnalogCountyID, Year, Season, Distance, AnalogRank)
    SELECT
        p_targetCountyID AS TargetCountyID,
        dc.AnalogCountyID AS AnalogCountyID,
        dc.Year,
        dc.Season,
        dc.Distance,
        RANK() OVER (
            PARTITION BY p_targetCountyID, dc.Year, dc.Season
            ORDER BY dc.Distance ASC, pd.PhysicalDistance ASC
        ) AS AnalogRank
    FROM (
        SELECT
            a.CountyID AS AnalogCountyID,
            t.Year,
            t.Season,
            ROUND(SQRT(POW((a.NormPrecipitation - t.Precipitation), 2) / POW(a.StdDevPrecipitation, 2)), 2) AS Distance
        FROM
            seasonal_precipitation_data_wi t
        CROSS JOIN
            seasonal_precipitation_norms a
        WHERE
            t.Season = a.Season
            AND t.CountyID = p_targetCountyID
    ) AS dc
    JOIN PhysicalDistances pd
    ON p_targetCountyID = pd.TargetCountyId
    AND dc.AnalogCountyID = pd.AnalogCountyId;

    
    REPLACE INTO seasonal_temperature_distances (TargetCountyID, AnalogCountyID, Year, Season, Distance, AnalogRank)
    SELECT
        p_targetCountyID AS TargetCountyID,
        dc.AnalogCountyID AS AnalogCountyID,
        dc.Year,
        dc.Season,
        dc.Distance,
        RANK() OVER (
            PARTITION BY p_targetCountyID, dc.Year, dc.Season
            ORDER BY dc.Distance ASC, pd.PhysicalDistance ASC
        ) AS AnalogRank
    FROM (
        SELECT
            a.CountyID AS AnalogCountyID,
            t.Year,
            t.Season,
            ROUND(SQRT(POW((a.NormTemperature - t.Temperature), 2) / POW(a.StdDevTemperature, 2)), 2) AS Distance
        FROM
            seasonal_temperature_data_wi t
        CROSS JOIN
            seasonal_temperature_norms a
        WHERE
            t.Season = a.Season
            AND t.CountyID = p_targetCountyID
    ) AS dc
    JOIN PhysicalDistances pd
    ON p_targetCountyID = pd.TargetCountyId
    AND dc.AnalogCountyID = pd.AnalogCountyId;

    
    CREATE TEMPORARY TABLE TempSeasonalCombinedDistances AS
    SELECT
        p.TargetCountyID,
        p.AnalogCountyID,
        p.Year,
        p.Season,
        ROUND(SQRT(POW(p.Distance, 2) + POW(t.Distance, 2)), 2) AS CombinedDistance
    FROM
        seasonal_precipitation_distances p
    JOIN seasonal_temperature_distances t
        ON p.TargetCountyID = t.TargetCountyID
        AND p.AnalogCountyID = t.AnalogCountyID
        AND p.Year = t.Year
        AND p.Season = t.Season
    WHERE
        p.TargetCountyID = p_targetCountyID;

    CREATE TEMPORARY TABLE TempSeasonalRankedDistances AS
    SELECT
        cd.TargetCountyID,
        cd.AnalogCountyID,
        cd.Year,
        cd.Season,
        cd.CombinedDistance,
        pd.PhysicalDistance,
        RANK() OVER (
            PARTITION BY cd.TargetCountyID, cd.Year, cd.Season
            ORDER BY cd.CombinedDistance ASC, 
                     pd.PhysicalDistance ASC
        ) AS AnalogRank
    FROM
        TempSeasonalCombinedDistances cd
    JOIN PhysicalDistances pd
        ON cd.TargetCountyID = pd.TargetCountyId
        AND cd.AnalogCountyID = pd.AnalogCountyId;

    REPLACE INTO seasonal_combined_distances (TargetCountyID, AnalogCountyID, Year, Season, Distance, AnalogRank)
    SELECT
        TargetCountyID,
        AnalogCountyID,
        Year,
        Season,
        CombinedDistance,
        AnalogRank
    FROM
        TempSeasonalRankedDistances
    WHERE
        AnalogRank <= 50;

    
    DROP TEMPORARY TABLE IF EXISTS TempSeasonalCombinedDistances;
    DROP TEMPORARY TABLE IF EXISTS TempSeasonalRankedDistances;

    
    DELETE FROM seasonal_precipitation_distances 
    WHERE TargetCountyID = p_targetCountyID AND AnalogRank > 150;

    
    DELETE FROM seasonal_temperature_distances 
    WHERE TargetCountyID = p_targetCountyID AND AnalogRank > 150;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CalculateAllSeasonalDistancesForWI` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `CalculateAllSeasonalDistancesForWI`()
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_targetCountyID INT;
    DECLARE v_countyCursor CURSOR FOR 
        SELECT CountyID FROM Counties WHERE StateCode = '47';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    OPEN v_countyCursor;

    
    county_loop: LOOP
        FETCH v_countyCursor INTO v_targetCountyID;

        IF v_done THEN
            LEAVE county_loop;
        END IF;

        
        CALL CalculateAllSeasonalDistancesForCounty(v_targetCountyID);
    END LOOP county_loop;

    CLOSE v_countyCursor;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CalculateMonthlyCombinedDistances` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `CalculateMonthlyCombinedDistances`()
BEGIN
  
  REPLACE INTO monthly_combined_distances
    (TargetCountyID, AnalogCountyID, Year, Month, Distance)
  SELECT
    p.TargetCountyID,
    p.AnalogCountyID,
    p.Year,
    p.Month,
    ROUND(SQRT(POW(p.Distance, 2) + POW(t.Distance, 2)), 2) AS Distance
  FROM monthly_precipitation_distances_TEMP p
  JOIN monthly_temperature_distances_TEMP   t
    ON t.TargetCountyID = p.TargetCountyID
   AND t.AnalogCountyID = p.AnalogCountyID
   AND t.Year           = p.Year
   AND t.Month          = p.Month;

  TRUNCATE TABLE monthly_precipitation_distances_TEMP;
  TRUNCATE TABLE monthly_temperature_distances_TEMP;


  
  

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CalculateMonthlyCombinedDistancesForCounty` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `CalculateMonthlyCombinedDistancesForCounty`(p_WICountyID INT)
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_analogCountyID INT;
    DECLARE v_year INT;
    DECLARE v_month VARCHAR(2);
    DECLARE v_precipDistance DECIMAL(6, 2);
    DECLARE v_tempDistance DECIMAL(6, 2);
    DECLARE v_combinedDistance DECIMAL(6, 2);

    DECLARE v_analogCursor CURSOR FOR 
        SELECT AnalogCountyID, Year, Month, Distance 
        FROM monthly_precipitation_distances_TEMP
        WHERE TargetCountyID = p_WICountyID;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    OPEN v_analogCursor;

    analog_loop: LOOP
        FETCH v_analogCursor INTO v_analogCountyID, v_year, v_month, v_precipDistance;
        
        IF v_done THEN
            LEAVE analog_loop;
        END IF;

        
        SELECT Distance INTO v_tempDistance
        FROM monthly_temperature_distances_TEMP
        WHERE TargetCountyID = p_WICountyID
          AND AnalogCountyID = v_analogCountyID
          AND Year = v_year
          AND Month = v_month
        LIMIT 1;

        
        SET v_combinedDistance = ROUND(SQRT(POW(v_precipDistance, 2) + POW(v_tempDistance, 2)), 2);

        
        REPLACE INTO monthly_combined_distances (
            TargetCountyID, AnalogCountyID, Year, Month, Distance
        )
        VALUES (
            p_WICountyID, v_analogCountyID, v_year, v_month, v_combinedDistance
        );

      
    END LOOP analog_loop;

    CLOSE v_analogCursor;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CalculateMonthlyPrecipitationDistances` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `CalculateMonthlyPrecipitationDistances`()
BEGIN
  TRUNCATE TABLE monthly_precipitation_distances_TEMP;

  INSERT INTO monthly_precipitation_distances_TEMP
    (TargetCountyID, AnalogCountyID, Year, Month, Distance)
  SELECT
    t.CountyID,
    a.CountyID,
    t.Year,
    t.Month,
    ROUND(SQRT(POW((a.NormPrecipitation - t.Precipitation), 2) / POW(a.StdDevPrecipitation, 2)), 2)
  FROM WICountyMonthlyPrecip_TEMP t
  JOIN monthly_precipitation_norms a
    ON a.Month = t.Month;

  REPLACE INTO monthly_precipitation_distances
    (TargetCountyID, AnalogCountyID, Year, Month, Distance)
  SELECT TargetCountyID, AnalogCountyID, Year, Month, Distance
  FROM monthly_precipitation_distances_TEMP;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CalculateMonthlyPrecipitationDistancesForCounty` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `CalculateMonthlyPrecipitationDistancesForCounty`(p_WICountyID INT)
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_analogCountyID INT;
    DECLARE v_year INT;
    DECLARE v_month VARCHAR(2);
    DECLARE v_precipDistance DECIMAL(6, 2);

    DECLARE v_analogCursor CURSOR FOR 
        SELECT 
            a.CountyID AS AnalogCountyID, 
            t.Year, 
            t.Month, 
            ROUND(SQRT(POW((a.NormPrecipitation - t.Precipitation), 2) / POW(a.StdDevPrecipitation, 2)), 2) AS Distance
        FROM WICountyMonthlyPrecip_TEMP t
        CROSS JOIN monthly_precipitation_norms a
        WHERE t.CountyID = p_WICountyID
          AND t.Month = a.Month;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    OPEN v_analogCursor;
    
    analog_loop: LOOP
        FETCH v_analogCursor INTO v_analogCountyID, v_year, v_month, v_precipDistance;
        
        IF v_done THEN
            LEAVE analog_loop;
        END IF;

        
        REPLACE INTO monthly_precipitation_distances (
            TargetCountyID, AnalogCountyID, Year, Month, Distance
        )
        VALUES (
            p_WICountyID, v_analogCountyID, v_year, v_month, v_precipDistance
        );

        
        REPLACE INTO monthly_precipitation_distances_TEMP (
            TargetCountyID, AnalogCountyID, Year, Month, Distance
        )
        VALUES (
            p_WICountyID, v_analogCountyID, v_year, v_month, v_precipDistance
        );
    END LOOP analog_loop;

    CLOSE v_analogCursor;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CalculateMonthlyTemperatureDistances` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `CalculateMonthlyTemperatureDistances`()
BEGIN
  TRUNCATE TABLE monthly_temperature_distances_TEMP;

  INSERT INTO monthly_temperature_distances_TEMP
    (TargetCountyID, AnalogCountyID, Year, Month, Distance)
  SELECT
    t.CountyID,
    a.CountyID,
    t.Year,
    t.Month,
    ROUND(SQRT(POW((a.NormTemperature - t.Temperature), 2) / POW(a.StdDevTemperature, 2)), 2)
  FROM WICountyMonthlyTemp_TEMP t
  JOIN monthly_temperature_norms a
    ON a.Month = t.Month;

  REPLACE INTO monthly_temperature_distances
    (TargetCountyID, AnalogCountyID, Year, Month, Distance)
  SELECT TargetCountyID, AnalogCountyID, Year, Month, Distance
  FROM monthly_temperature_distances_TEMP;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CalculateMonthlyTemperatureDistancesForCounty` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `CalculateMonthlyTemperatureDistancesForCounty`(p_WICountyID INT)
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_analogCountyID INT;
    DECLARE v_year INT;
    DECLARE v_month VARCHAR(2);
    DECLARE v_tempDistance DECIMAL(6, 2);

    DECLARE v_analogCursor CURSOR FOR 
        SELECT 
            a.CountyID AS AnalogCountyID, 
            t.Year, 
            t.Month, 
            ROUND(SQRT(POW((a.NormTemperature - t.Temperature), 2) / POW(a.StdDevTemperature, 2)), 2) AS Distance
        FROM WICountyMonthlyTemp_TEMP t
        CROSS JOIN monthly_temperature_norms a
        WHERE t.CountyID = p_WICountyID AND t.Month = a.Month;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    OPEN v_analogCursor;
    
    analog_loop: LOOP
        FETCH v_analogCursor INTO v_analogCountyID, v_year, v_month, v_tempDistance;
        
        IF v_done THEN
            LEAVE analog_loop;
        END IF;
        
        
        REPLACE INTO monthly_temperature_distances (
            TargetCountyID, AnalogCountyID, Year, Month, Distance
        )
        VALUES (
            p_WICountyID, v_analogCountyID, v_year, v_month, v_tempDistance
        );

        
        REPLACE INTO monthly_temperature_distances_TEMP (
            TargetCountyID, AnalogCountyID, Year, Month, Distance
        )
        VALUES (
            p_WICountyID, v_analogCountyID, v_year, v_month, v_tempDistance
        );
    END LOOP analog_loop;

    CLOSE v_analogCursor;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CalculateSeasonalCombinedDistances` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `CalculateSeasonalCombinedDistances`()
BEGIN
  
  REPLACE INTO seasonal_combined_distances
    (TargetCountyID, AnalogCountyID, Year, Season, Distance)
  SELECT
    p.TargetCountyID,
    p.AnalogCountyID,
    p.Year,
    p.Season,
    ROUND(SQRT(POW(p.Distance, 2) + POW(t.Distance, 2)), 2) AS Distance
  FROM seasonal_precipitation_distances_TEMP p
  JOIN seasonal_temperature_distances_TEMP   t
    ON t.TargetCountyID = p.TargetCountyID
   AND t.AnalogCountyID = p.AnalogCountyID
   AND t.Year           = p.Year
   AND t.Season         = p.Season;

  TRUNCATE TABLE seasonal_precipitation_distances_TEMP;
  TRUNCATE TABLE seasonal_temperature_distances_TEMP;

  
  
  
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CalculateSeasonalCombinedDistancesForCounty` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `CalculateSeasonalCombinedDistancesForCounty`(p_WICountyID INT)
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_analogCountyID INT;
    DECLARE v_year INT;
    DECLARE v_season VARCHAR(6);
    DECLARE v_precipDistance DECIMAL(5, 2);
    DECLARE v_tempDistance DECIMAL(5, 2);
    DECLARE v_combinedDistance DECIMAL(5, 2);

    DECLARE v_analogCursor CURSOR FOR 
        SELECT AnalogCountyID, Year, Season, Distance 
        FROM seasonal_precipitation_distances_TEMP 
        WHERE TargetCountyID = p_WICountyID;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    OPEN v_analogCursor;
    
    analog_loop: LOOP
        FETCH v_analogCursor INTO v_analogCountyID, v_year, v_season, v_precipDistance;
        
        IF v_done THEN
            LEAVE analog_loop;
        END IF;
        
        
        SELECT Distance INTO v_tempDistance
        FROM seasonal_temperature_distances_TEMP
        WHERE TargetCountyID = p_WICountyID
          AND AnalogCountyID = v_analogCountyID
          AND Year = v_year
          AND Season = v_season
        LIMIT 1;

        
        SET v_combinedDistance = ROUND(SQRT(POW(v_precipDistance, 2) + POW(v_tempDistance, 2)), 2);

        
        REPLACE INTO seasonal_combined_distances (
            TargetCountyID, AnalogCountyID, Year, Season, Distance
        )
        VALUES (
            p_WICountyID, v_analogCountyID, v_year, v_season, v_combinedDistance
        );

    END LOOP analog_loop;

    CLOSE v_analogCursor;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CalculateSeasonalPrecipitationDistances` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `CalculateSeasonalPrecipitationDistances`()
BEGIN
  TRUNCATE TABLE seasonal_precipitation_distances_TEMP;

  INSERT INTO seasonal_precipitation_distances_TEMP
    (TargetCountyID, AnalogCountyID, Year, Season, Distance)
  SELECT
    t.CountyID,
    a.CountyID,
    t.Year,
    t.Season,
    ROUND(SQRT(POW((a.NormPrecipitation - t.Precipitation), 2) / POW(a.StdDevPrecipitation, 2)), 2)
  FROM WICountySeasonalPrecip_TEMP t
  JOIN seasonal_precipitation_norms a
    ON a.Season = t.Season;

  REPLACE INTO seasonal_precipitation_distances
    (TargetCountyID, AnalogCountyID, Year, Season, Distance)
  SELECT TargetCountyID, AnalogCountyID, Year, Season, Distance
  FROM seasonal_precipitation_distances_TEMP;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CalculateSeasonalPrecipitationDistancesForCounty` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `CalculateSeasonalPrecipitationDistancesForCounty`(p_WICountyID INT)
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_analogCountyID INT;
    DECLARE v_year INT;
    DECLARE v_season VARCHAR(6);
    DECLARE v_precipDistance DECIMAL(5, 2);

    DECLARE v_analogCursor CURSOR FOR 
        SELECT a.CountyID AS AnalogCountyID, t.Year, t.Season, 
               ROUND(SQRT(POW((a.NormPrecipitation - t.Precipitation), 2) / POW(a.StdDevPrecipitation, 2)), 2) AS Distance
        FROM WICountySeasonalPrecip_TEMP t
        CROSS JOIN seasonal_precipitation_norms a
        WHERE t.CountyID = p_WICountyID AND t.Season = a.Season;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    OPEN v_analogCursor;

    analog_loop: LOOP
        FETCH v_analogCursor INTO v_analogCountyID, v_year, v_season, v_precipDistance;

        IF v_done THEN
            LEAVE analog_loop;
        END IF;

        
        REPLACE INTO seasonal_precipitation_distances (
            TargetCountyID, AnalogCountyID, Year, Season, Distance
        ) VALUES (
            p_WICountyID, v_analogCountyID, v_year, v_season, v_precipDistance
        );

        
        REPLACE INTO seasonal_precipitation_distances_TEMP (
            TargetCountyID, AnalogCountyID, Year, Season, Distance
        ) VALUES (
            p_WICountyID, v_analogCountyID, v_year, v_season, v_precipDistance
        );
    END LOOP analog_loop;

    CLOSE v_analogCursor;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CalculateSeasonalTemperatureDistances` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `CalculateSeasonalTemperatureDistances`()
BEGIN
  TRUNCATE TABLE seasonal_temperature_distances_TEMP;

  INSERT INTO seasonal_temperature_distances_TEMP
    (TargetCountyID, AnalogCountyID, Year, Season, Distance)
  SELECT
    t.CountyID,
    a.CountyID,
    t.Year,
    t.Season,
    ROUND(SQRT(POW((a.NormTemperature - t.Temperature), 2) / POW(a.StdDevTemperature, 2)), 2)
  FROM WICountySeasonalTemp_TEMP t
  JOIN seasonal_temperature_norms a
    ON a.Season = t.Season;

  REPLACE INTO seasonal_temperature_distances
    (TargetCountyID, AnalogCountyID, Year, Season, Distance)
  SELECT TargetCountyID, AnalogCountyID, Year, Season, Distance
  FROM seasonal_temperature_distances_TEMP;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CalculateSeasonalTemperatureDistancesForCounty` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `CalculateSeasonalTemperatureDistancesForCounty`(p_WICountyID INT)
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_analogCountyID INT;
    DECLARE v_year INT;
    DECLARE v_season VARCHAR(6);
    DECLARE v_tempDistance DECIMAL(5, 2);

    DECLARE v_analogCursor CURSOR FOR 
        SELECT a.CountyID AS AnalogCountyID, t.Year, t.Season, 
               ROUND(SQRT(POW((a.NormTemperature - t.Temperature), 2) / POW(a.StdDevTemperature, 2)), 2) AS Distance
        FROM WICountySeasonalTemp_TEMP t
        CROSS JOIN seasonal_temperature_norms a
        WHERE t.CountyID = p_WICountyID AND t.Season = a.Season;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    OPEN v_analogCursor;

    analog_loop: LOOP
        FETCH v_analogCursor INTO v_analogCountyID, v_year, v_season, v_tempDistance;

        IF v_done THEN
            LEAVE analog_loop;
        END IF;

        
        REPLACE INTO seasonal_temperature_distances (
            TargetCountyID, AnalogCountyID, Year, Season, Distance
        ) VALUES (
            p_WICountyID, v_analogCountyID, v_year, v_season, v_tempDistance
        );

        
        REPLACE INTO seasonal_temperature_distances_TEMP (
            TargetCountyID, AnalogCountyID, Year, Season, Distance
        ) VALUES (
            p_WICountyID, v_analogCountyID, v_year, v_season, v_tempDistance
        );
    END LOOP analog_loop;

    CLOSE v_analogCursor;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CalculateYearlyCombinedDistances` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `CalculateYearlyCombinedDistances`()
BEGIN
  REPLACE INTO yearly_combined_distances
    (TargetCountyID, AnalogCountyID, Year, Distance)
  SELECT
    p.TargetCountyID,
    p.AnalogCountyID,
    p.Year,
    ROUND(SQRT(POW(p.Distance, 2) + POW(t.Distance, 2)), 2) AS Distance
  FROM yearly_precipitation_distances_TEMP p
  JOIN yearly_temperature_distances_TEMP   t
    ON t.TargetCountyID = p.TargetCountyID
   AND t.AnalogCountyID = p.AnalogCountyID
   AND t.Year           = p.Year;

  TRUNCATE TABLE yearly_precipitation_distances_TEMP;
  TRUNCATE TABLE yearly_temperature_distances_TEMP;

  
  

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CalculateYearlyCombinedDistancesForCounty` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `CalculateYearlyCombinedDistancesForCounty`(p_WICountyID INT)
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_analogCountyID INT;
    DECLARE v_year INT;
    DECLARE v_precipDistance DECIMAL(5, 2);
    DECLARE v_tempDistance DECIMAL(5, 2);
    DECLARE v_combinedDistance DECIMAL(5, 2);

    DECLARE v_analogCursor CURSOR FOR 
        SELECT AnalogCountyID, Year, Distance 
        FROM yearly_precipitation_distances_TEMP
        WHERE TargetCountyID = p_WICountyID;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    OPEN v_analogCursor;
    
    analog_loop: LOOP
        FETCH v_analogCursor INTO v_analogCountyID, v_year, v_precipDistance;
        
        IF v_done THEN
            LEAVE analog_loop;
        END IF;

        
        SELECT Distance INTO v_tempDistance
        FROM yearly_temperature_distances_TEMP
        WHERE TargetCountyID = p_WICountyID
          AND AnalogCountyID = v_analogCountyID
          AND Year = v_year
        LIMIT 1;

        
        SET v_combinedDistance = ROUND(SQRT(POW(v_precipDistance, 2) + POW(v_tempDistance, 2)), 2);

        
        REPLACE INTO yearly_combined_distances (TargetCountyID, AnalogCountyID, Year, Distance)
        VALUES (p_WICountyID, v_analogCountyID, v_year, v_combinedDistance);
    END LOOP analog_loop;
    CLOSE v_analogCursor;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CalculateYearlyPrecipitationDistances` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `CalculateYearlyPrecipitationDistances`()
BEGIN
  
  TRUNCATE TABLE yearly_precipitation_distances_TEMP;

  INSERT INTO yearly_precipitation_distances_TEMP
    (TargetCountyID, AnalogCountyID, Year, Distance)
  SELECT
    t.CountyID,
    a.CountyID,
    t.Year,
    ROUND(SQRT(POW((a.NormPrecipitation - t.Precipitation), 2) / POW(a.StdDevPrecipitation, 2)), 2)
  FROM WICountyYearlyPrecip_TEMP t
  CROSS JOIN yearly_precipitation_norms a;

  
  REPLACE INTO yearly_precipitation_distances
    (TargetCountyID, AnalogCountyID, Year, Distance)
  SELECT TargetCountyID, AnalogCountyID, Year, Distance
  FROM yearly_precipitation_distances_TEMP;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CalculateYearlyPrecipitationDistancesForCounty` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `CalculateYearlyPrecipitationDistancesForCounty`(p_WICountyID INT)
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_analogCountyID INT;
    DECLARE v_year INT;
    DECLARE v_precipDistance DECIMAL(6, 2);
    DECLARE v_rank INT;

    
    CREATE TEMPORARY TABLE TempYearlyPrecipitationDistances (
        TargetCountyID INT,
        AnalogCountyID INT,
        Year INT,
        Distance DECIMAL(6, 2),
        PhysicalDistance DECIMAL(8, 6)
    );
    
    
    INSERT INTO TempYearlyPrecipitationDistances (TargetCountyID, AnalogCountyID, Year, Distance, PhysicalDistance)
    SELECT 
        p_WICountyID AS TargetCountyID, 
        a.CountyID AS AnalogCountyID, 
        t.Year, 
        ROUND(SQRT(POW((a.NormPrecipitation - t.Precipitation), 2) / POW(a.StdDevPrecipitation, 2)), 2) AS Distance,
        pd.PhysicalDistance
    FROM 
        yearly_precipitation_data_wi t
    JOIN 
        yearly_precipitation_norms a ON t.CountyID = p_WICountyID
    JOIN 
        PhysicalDistances pd ON pd.TargetCountyId = p_WICountyID AND pd.AnalogCountyId = a.CountyID;

    
    SET v_rank = 0;
    REPLACE INTO yearly_precipitation_distances (TargetCountyID, AnalogCountyID, Year, Distance, AnalogRank)
    SELECT 
        TargetCountyID, 
        AnalogCountyID, 
        Year, 
        Distance, 
        @v_rank := @v_rank + 1 AS AnalogRank
    FROM 
        TempYearlyPrecipitationDistances
    ORDER BY 
        Distance ASC, 
        PhysicalDistance ASC
    LIMIT 150;

    
    DROP TEMPORARY TABLE IF EXISTS TempYearlyPrecipitationDistances;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `CalculateYearlyTemperatureDistances` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `CalculateYearlyTemperatureDistances`()
BEGIN
  TRUNCATE TABLE yearly_temperature_distances_TEMP;

  INSERT INTO yearly_temperature_distances_TEMP
    (TargetCountyID, AnalogCountyID, Year, Distance)
  SELECT
    t.CountyID,
    a.CountyID,
    t.Year,
    ROUND(SQRT(POW((a.NormTemperature - t.Temperature), 2) / POW(a.StdDevTemperature, 2)), 2)
  FROM WICountyYearlyTemp_TEMP t
  CROSS JOIN yearly_temperature_norms a;

  REPLACE INTO yearly_temperature_distances
    (TargetCountyID, AnalogCountyID, Year, Distance)
  SELECT TargetCountyID, AnalogCountyID, Year, Distance
  FROM yearly_temperature_distances_TEMP;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetAllTopCombinedAnalogsForCountyByMonth` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `GetAllTopCombinedAnalogsForCountyByMonth`(
    IN p_TargetCountyName VARCHAR(100),
    IN p_Month VARCHAR(2)
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        SELECT 
            subquery.TargetCountyID,
            subquery.TargetCountyName,
            subquery.Year,
            subquery.Month,
            subquery.AnalogCountyID,
            subquery.AnalogCountyName,
            subquery.StateAbbr AS AnalogCountyStateAbbr,
            subquery.Distance,
            subquery.Precipitation AS TargetPrecipValue,
            subquery.AnalogPrecipNormal,
            subquery.Temperature AS TargetTempValue,
            subquery.AnalogTempNormal,
            subquery.AnalogCountyLatitude,
            subquery.Longitude AS AnalogCountyLongitude
        FROM (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.Month,
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr,
                d.Distance,
                pd.Precipitation,
                pn.NormPrecipitation AS AnalogPrecipNormal,
                td.Temperature,
                tn.NormTemperature AS AnalogTempNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude,
                ROW_NUMBER() OVER (
                    PARTITION BY d.Year
                    ORDER BY d.Distance, 
                    SQRT(POW(tc.Latitude - ac.Latitude, 2) + POW(tc.Longitude - ac.Longitude, 2))
                ) AS rn
            FROM monthly_combined_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN monthly_precipitation_data_wi pd ON d.TargetCountyID = pd.CountyID AND d.Year = pd.Year AND d.Month = pd.Month
            JOIN monthly_precipitation_norms pn ON d.AnalogCountyID = pn.CountyID AND d.Month = pn.Month
            JOIN monthly_temperature_data_wi td ON d.TargetCountyID = td.CountyID AND d.Year = td.Year AND d.Month = td.Month
            JOIN monthly_temperature_norms tn ON d.AnalogCountyID = tn.CountyID AND d.Month = tn.Month
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Month = p_Month
        ) AS subquery
        WHERE subquery.rn = 1;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetAllTopCombinedAnalogsForCountyBySeason` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `GetAllTopCombinedAnalogsForCountyBySeason`(
    IN p_TargetCountyName VARCHAR(100),
    IN p_Season VARCHAR(6)
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        SELECT 
            subquery.TargetCountyID,
            subquery.TargetCountyName,
            subquery.Year,
            subquery.Season,
            subquery.AnalogCountyID,
            subquery.AnalogCountyName,
            subquery.AnalogCountyStateAbbr,
            subquery.Distance,
            subquery.TargetTempValue,
            subquery.AnalogTempNormal,
            subquery.TargetPrecipValue,
            subquery.AnalogPrecipNormal,
            subquery.AnalogCountyLatitude,
            subquery.AnalogCountyLongitude,
            subquery.rn AS RowNumber
        FROM (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.Season,
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                td.Temperature AS TargetTempValue,
                tn.NormTemperature AS AnalogTempNormal,
                pd.Precipitation AS TargetPrecipValue,
                pn.NormPrecipitation AS AnalogPrecipNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (
                    PARTITION BY d.Year, d.Season
                    ORDER BY d.Distance, 
                             pdist.PhysicalDistance
                ) AS rn
            FROM seasonal_combined_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN seasonal_temperature_data_wi td ON d.TargetCountyID = td.CountyID AND d.Year = td.Year AND d.Season = td.Season
            JOIN seasonal_temperature_norms tn ON d.AnalogCountyID = tn.CountyID AND d.Season = tn.Season
            JOIN seasonal_precipitation_data_wi pd ON d.TargetCountyID = pd.CountyID AND d.Year = pd.Year AND d.Season = pd.Season
            JOIN seasonal_precipitation_norms pn ON d.AnalogCountyID = pn.CountyID AND d.Season = pn.Season
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyID AND d.AnalogCountyID = pdist.AnalogCountyID
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Season = p_Season
        ) AS subquery
        WHERE subquery.rn = 1;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetAllTopCombinedAnalogsForCountyByYear` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `GetAllTopCombinedAnalogsForCountyByYear`(IN p_TargetCountyName VARCHAR(100))
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        SELECT 
            subquery.TargetCountyID,
            subquery.TargetCountyName,
            subquery.Year,
            subquery.AnalogCountyID,
            subquery.AnalogCountyName,
            subquery.AnalogCountyStateAbbr,
            subquery.Distance,
            subquery.TargetTempValue,
            subquery.TargetPrecipValue,
            subquery.AnalogTempNormal,
            subquery.AnalogPrecipNormal,
            subquery.AnalogCountyLatitude,
            subquery.AnalogCountyLongitude
        FROM (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                td.Temperature AS TargetTempValue,
                pd.Precipitation AS TargetPrecipValue,
                tn.NormTemperature AS AnalogTempNormal,
                pn.NormPrecipitation AS AnalogPrecipNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (
                    PARTITION BY d.Year 
                    ORDER BY d.Distance, 
                    pdist.PhysicalDistance
                ) AS rn
            FROM yearly_combined_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN yearly_temperature_data_wi td ON d.TargetCountyID = td.CountyID AND d.Year = td.Year
            JOIN yearly_precipitation_data_wi pd ON d.TargetCountyID = pd.CountyID AND d.Year = pd.Year
            JOIN yearly_temperature_norms tn ON d.AnalogCountyID = tn.CountyID
            JOIN yearly_precipitation_norms pn ON d.AnalogCountyID = pn.CountyID
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyID AND d.AnalogCountyID = pdist.AnalogCountyID
            WHERE d.TargetCountyID = v_TargetCountyID 
        ) AS subquery
        WHERE subquery.rn = 1;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetAllTopPrecipAnalogsForCountyByMonth` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `GetAllTopPrecipAnalogsForCountyByMonth`(
    IN p_TargetCountyName VARCHAR(100),
    IN p_Month VARCHAR(2)
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        SELECT 
            subquery.TargetCountyID,
            subquery.TargetCountyName,
            subquery.Year,
            subquery.Month,
            subquery.AnalogCountyID,
            subquery.AnalogCountyName,
            subquery.StateAbbr AS AnalogCountyStateAbbr,
            subquery.Distance,
            subquery.TargetPrecipValue,
            subquery.AnalogPrecipNormal,
            subquery.AnalogCountyLatitude,
            subquery.AnalogCountyLongitude
        FROM (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.Month,
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr,
                d.Distance,
                pd.Precipitation AS TargetPrecipValue,
                pn.NormPrecipitation AS AnalogPrecipNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (
                    PARTITION BY d.Year 
                    ORDER BY d.Distance, 
                    SQRT(POW(tc.Latitude - ac.Latitude, 2) + POW(tc.Longitude - ac.Longitude, 2))
                ) AS rn
            FROM monthly_precipitation_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN monthly_precipitation_data_wi pd ON d.TargetCountyID = pd.CountyID AND d.Year = pd.Year AND d.Month = pd.Month
            JOIN monthly_precipitation_norms pn ON d.AnalogCountyID = pn.CountyID AND d.Month = pn.Month
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Month = p_Month
        ) AS subquery
        WHERE subquery.rn = 1;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetAllTopPrecipAnalogsForCountyBySeason` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `GetAllTopPrecipAnalogsForCountyBySeason`(
    IN p_TargetCountyName VARCHAR(100),
    IN p_Season VARCHAR(6)
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        SELECT 
            subquery.TargetCountyID,
            subquery.TargetCountyName,
            subquery.Year,
            subquery.Season,
            subquery.AnalogCountyID,
            subquery.AnalogCountyName,
            subquery.StateAbbr AS AnalogCountyStateAbbr,
            subquery.Distance,
            subquery.Precipitation AS TargetPrecipValue,
            subquery.AnalogPrecipNormal,
            subquery.AnalogCountyLatitude,
            subquery.AnalogCountyLongitude
        FROM (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.Season,
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr,
                d.Distance,
                pd.Precipitation,
                pn.NormPrecipitation AS AnalogPrecipNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (
                    PARTITION BY d.Year, d.Season
                    ORDER BY d.Distance, 
                    SQRT(POW(tc.Latitude - ac.Latitude, 2) + POW(tc.Longitude - ac.Longitude, 2))
                ) AS rn
            FROM seasonal_precipitation_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN seasonal_precipitation_data_wi pd ON d.TargetCountyID = pd.CountyID AND d.Year = pd.Year AND d.Season = pd.Season
            JOIN seasonal_precipitation_norms pn ON d.AnalogCountyID = pn.CountyID AND d.Season = pn.Season
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Season = p_Season
        ) AS subquery
        WHERE subquery.rn = 1;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetAllTopPrecipAnalogsForCountyByYear` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `GetAllTopPrecipAnalogsForCountyByYear`(IN p_TargetCountyName VARCHAR(100))
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        SELECT 
            subquery.TargetCountyID,
            subquery.TargetCountyName,
            subquery.Year,
            subquery.AnalogCountyID,
            subquery.AnalogCountyName,
            subquery.AnalogCountyStateAbbr,
            subquery.Distance,
            subquery.Precipitation AS TargetPrecipValue,
            subquery.AnalogPrecipNormal,
            subquery.AnalogCountyLatitude,
            subquery.AnalogCountyLongitude
        FROM (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                pd.Precipitation,
                pn.NormPrecipitation AS AnalogPrecipNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (
                    PARTITION BY d.Year 
                    ORDER BY d.Distance, 
                    pdist.PhysicalDistance
                ) AS rn
            FROM yearly_precipitation_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN yearly_precipitation_data_wi pd ON d.TargetCountyID = pd.CountyID AND d.Year = pd.Year
            JOIN yearly_precipitation_norms pn ON d.AnalogCountyID = pn.CountyID
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyID AND d.AnalogCountyID = pdist.AnalogCountyID
            WHERE d.TargetCountyID = v_TargetCountyID 
        ) AS subquery
        WHERE subquery.rn = 1;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetAllTopTempAnalogsForCountyByMonth` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `GetAllTopTempAnalogsForCountyByMonth`(
    IN p_TargetCountyName VARCHAR(100),
    IN p_Month VARCHAR(2)
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        SELECT 
            subquery.TargetCountyID,
            subquery.TargetCountyName,
            subquery.Year,
            subquery.Month,
            subquery.AnalogCountyID,
            subquery.AnalogCountyName,
            subquery.StateAbbr AS AnalogCountyStateAbbr,
            subquery.Distance,
            subquery.Temperature AS TargetTempValue,
            subquery.AnalogTempNormal,
            subquery.AnalogCountyLatitude,
            subquery.AnalogCountyLongitude
        FROM (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.Month,
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr,
                d.Distance,
                td.Temperature,
                tn.NormTemperature AS AnalogTempNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (
                    PARTITION BY d.Year
                    ORDER BY d.Distance, 
                    SQRT(POW(tc.Latitude - ac.Latitude, 2) + POW(tc.Longitude - ac.Longitude, 2))
                ) AS rn
            FROM monthly_temperature_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN monthly_temperature_data_wi td ON d.TargetCountyID = td.CountyID AND d.Year = td.Year AND d.Month = td.Month
            JOIN monthly_temperature_norms tn ON d.AnalogCountyID = tn.CountyID AND d.Month = tn.Month
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Month = p_Month
        ) AS subquery
        WHERE subquery.rn = 1;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetAllTopTempAnalogsForCountyBySeason` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `GetAllTopTempAnalogsForCountyBySeason`(
    IN p_TargetCountyName VARCHAR(100),
    IN p_Season VARCHAR(6)
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        SELECT 
            subquery.TargetCountyID,
            subquery.TargetCountyName,
            subquery.Year,
            subquery.Season,
            subquery.AnalogCountyID,
            subquery.AnalogCountyName,
            subquery.AnalogCountyStateAbbr,
            subquery.Distance,
            subquery.Temperature AS TargetTempValue,
            subquery.AnalogTempNormal,
            subquery.AnalogCountyLatitude,
            subquery.AnalogCountyLongitude
        FROM (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.Season,
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                td.Temperature,
                tn.NormTemperature AS AnalogTempNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (
                    PARTITION BY d.Year, d.Season
                    ORDER BY d.Distance, 
                    SQRT(POW(tc.Latitude - ac.Latitude, 2) + POW(tc.Longitude - ac.Longitude, 2))
                ) AS rn
            FROM seasonal_temperature_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN seasonal_temperature_data_wi td ON d.TargetCountyID = td.CountyID AND d.Year = td.Year AND d.Season = td.Season
            JOIN seasonal_temperature_norms tn ON d.AnalogCountyID = tn.CountyID AND d.Season = tn.Season
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Season = p_Season
        ) AS subquery
        WHERE subquery.rn = 1;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetAllTopTempAnalogsForCountyByYear` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `GetAllTopTempAnalogsForCountyByYear`(IN p_TargetCountyName VARCHAR(100))
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        SELECT 
            subquery.TargetCountyID,
            subquery.TargetCountyName,
            subquery.Year,
            subquery.AnalogCountyID,
            subquery.AnalogCountyName,
            subquery.AnalogCountyStateAbbr,
            subquery.Distance,
            subquery.TargetTempValue,
            subquery.AnalogTempNormal,
            subquery.AnalogCountyLatitude,
            subquery.AnalogCountyLongitude
        FROM (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                td.Temperature AS TargetTempValue,
                tn.NormTemperature AS AnalogTempNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (
                    PARTITION BY d.Year 
                    ORDER BY d.Distance, 
                    pdist.PhysicalDistance
                ) AS rn
            FROM yearly_temperature_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN yearly_temperature_data_wi td ON d.TargetCountyID = td.CountyID AND d.Year = td.Year
            JOIN yearly_temperature_norms tn ON d.AnalogCountyID = tn.CountyID
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyID AND d.AnalogCountyID = pdist.AnalogCountyID
            WHERE d.TargetCountyID = v_TargetCountyID 
        ) AS subquery
        WHERE subquery.rn = 1;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetCombinedAnalogsForCountyByYearAndMonth` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `GetCombinedAnalogsForCountyByYearAndMonth`(
    IN p_TargetCountyName VARCHAR(100),
    IN p_Year INT,
    IN p_Month VARCHAR(2)
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        WITH RankedAnalogs AS (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.Month,
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                pdist.PhysicalDistance,
                spd.Precipitation AS TargetPrecipValue,
                spn.NormPrecipitation AS AnalogPrecipNormal,
                std.Temperature AS TargetTempValue,
                stn.NormTemperature AS AnalogTempNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (PARTITION BY d.Month, d.Year ORDER BY d.Distance, pdist.PhysicalDistance) AS RowNumber
            FROM monthly_combined_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN monthly_precipitation_data_wi spd ON d.TargetCountyID = spd.CountyID AND d.Year = spd.Year AND d.Month = spd.Month
            JOIN monthly_precipitation_norms spn ON d.AnalogCountyID = spn.CountyID AND d.Month = spn.Month
            JOIN monthly_temperature_data_wi std ON d.TargetCountyID = std.CountyID AND d.Year = std.Year AND d.Month = std.Month
            JOIN monthly_temperature_norms stn ON d.AnalogCountyID = stn.CountyID AND d.Month = stn.Month
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyId AND d.AnalogCountyID = pdist.AnalogCountyId
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Year = p_Year
              AND d.Month = p_Month
             
        )
        SELECT * FROM RankedAnalogs
        WHERE RowNumber <= 50;  
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetCombinedAnalogsForCountyByYearAndSeason` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `GetCombinedAnalogsForCountyByYearAndSeason`(
    IN p_TargetCountyName VARCHAR(100),
    IN p_Year INT,
    IN p_Season VARCHAR(6)
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        WITH RankedAnalogs AS (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.Season,
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                pdist.PhysicalDistance,
                spd.Precipitation AS TargetPrecipValue,
                spn.NormPrecipitation AS AnalogPrecipNormal,
                std.Temperature AS TargetTempValue,
                stn.NormTemperature AS AnalogTempNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (PARTITION BY d.Season, d.Year ORDER BY d.Distance, pdist.PhysicalDistance) AS RowNumber
            FROM seasonal_combined_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN seasonal_precipitation_data_wi spd ON d.TargetCountyID = spd.CountyID AND d.Year = spd.Year AND d.Season = spd.Season
            JOIN seasonal_precipitation_norms spn ON d.AnalogCountyID = spn.CountyID AND d.Season = spn.Season
            JOIN seasonal_temperature_data_wi std ON d.TargetCountyID = std.CountyID AND d.Year = std.Year AND d.Season = std.Season
            JOIN seasonal_temperature_norms stn ON d.AnalogCountyID = stn.CountyID AND d.Season = stn.Season
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyId AND d.AnalogCountyID = pdist.AnalogCountyId
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Year = p_Year
              AND d.Season = p_Season
              
        )
        SELECT * FROM RankedAnalogs
        WHERE RowNumber <= 50;  
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetCountyIDByCodeAndState` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `GetCountyIDByCodeAndState`(
    IN p_CountyCode VARCHAR(3),
    IN p_StateCode VARCHAR(2)
)
BEGIN
    SELECT CountyID 
    FROM Counties 
    WHERE CountyCode = p_CountyCode AND StateCode = p_StateCode;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetPrecipAnalogsForCountyByYearAndMonth` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `GetPrecipAnalogsForCountyByYearAndMonth`(
    IN p_TargetCountyName VARCHAR(100),
    IN p_Year INT,
    IN p_Month VARCHAR(2)
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        WITH RankedPrecipAnalogs AS (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.Month,
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                pdist.PhysicalDistance,
                spd.Precipitation AS TargetPrecipValue,
                spn.NormPrecipitation AS AnalogPrecipNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (PARTITION BY d.Month, d.Year ORDER BY d.Distance, pdist.PhysicalDistance) AS RowNumber
            FROM monthly_precipitation_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN monthly_precipitation_data_wi spd ON d.TargetCountyID = spd.CountyID AND d.Year = spd.Year AND d.Month = spd.Month
            JOIN monthly_precipitation_norms spn ON d.AnalogCountyID = spn.CountyID AND d.Month = spn.Month
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyId AND d.AnalogCountyID = pdist.AnalogCountyId
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Year = p_Year
              AND d.Month = p_Month
        )
        SELECT * FROM RankedPrecipAnalogs
        WHERE RowNumber <= 150;  
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetPrecipAnalogsForCountyByYearAndSeason` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `GetPrecipAnalogsForCountyByYearAndSeason`(
    IN p_TargetCountyName VARCHAR(100),
    IN p_Year INT,
    IN p_Season VARCHAR(6)
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        WITH RankedPrecipAnalogs AS (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.Season,
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                td.Precipitation AS TargetPrecipValue,
                tn.NormPrecipitation AS AnalogPrecipNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (PARTITION BY d.Season, d.Year ORDER BY d.Distance, pdist.PhysicalDistance) AS RowNumber
            FROM seasonal_precipitation_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN seasonal_precipitation_data_wi td ON d.TargetCountyID = td.CountyID AND d.Year = td.Year AND d.Season = td.Season
            JOIN seasonal_precipitation_norms tn ON d.AnalogCountyID = tn.CountyID AND d.Season = tn.Season
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyId AND d.AnalogCountyID = pdist.AnalogCountyId
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Year = p_Year
              AND d.Season = p_Season
        
        )
        SELECT * FROM RankedPrecipAnalogs
        WHERE RowNumber <= 150;  
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetTempAnalogsForCountyByYearAndMonth` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `GetTempAnalogsForCountyByYearAndMonth`(
    IN p_TargetCountyName VARCHAR(100),
    IN p_Year INT,
    IN p_Month VARCHAR(2)
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        WITH RankedTempAnalogs AS (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.Month,
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                pdist.PhysicalDistance,
                std.Temperature AS TargetTempValue,
                stn.NormTemperature AS AnalogTempNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (PARTITION BY d.Month, d.Year ORDER BY d.Distance, pdist.PhysicalDistance) AS RowNumber
            FROM monthly_temperature_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN monthly_temperature_data_wi std ON d.TargetCountyID = std.CountyID AND d.Year = std.Year AND d.Month = std.Month
            JOIN monthly_temperature_norms stn ON d.AnalogCountyID = stn.CountyID AND d.Month = stn.Month
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyId AND d.AnalogCountyID = pdist.AnalogCountyId
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Year = p_Year
              AND d.Month = p_Month
        )
        SELECT * FROM RankedTempAnalogs
        WHERE RowNumber <= 150;  
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetTempAnalogsForCountyByYearAndSeason` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `GetTempAnalogsForCountyByYearAndSeason`(
    IN p_TargetCountyName VARCHAR(100),
    IN p_Year INT,
    IN p_Season VARCHAR(6)
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        WITH RankedTempAnalogs AS (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.Season,
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                td.Temperature AS TargetTempValue,
                tn.NormTemperature AS AnalogTempNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (PARTITION BY d.Season, d.Year ORDER BY d.Distance, pdist.PhysicalDistance) AS RowNumber
            FROM seasonal_temperature_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN seasonal_temperature_data_wi td ON d.TargetCountyID = td.CountyID AND d.Year = td.Year AND d.Season = td.Season
            JOIN seasonal_temperature_norms tn ON d.AnalogCountyID = tn.CountyID AND d.Season = tn.Season
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyId AND d.AnalogCountyID = pdist.AnalogCountyId
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Year = p_Year
              AND d.Season = p_Season
        )
        SELECT * FROM RankedTempAnalogs
        WHERE RowNumber <= 150;  
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetTopCombinedAnalogsForCountyByYear` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `GetTopCombinedAnalogsForCountyByYear`(
    IN p_TargetCountyName VARCHAR(100),
    IN p_Year INT
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        SELECT 
            subquery.TargetCountyID,
            subquery.TargetCountyName,
            subquery.Year,
            subquery.AnalogCountyID,
            subquery.AnalogCountyName,
            subquery.AnalogCountyStateAbbr,
            subquery.Distance,
            subquery.TargetTempValue,
            subquery.TargetPrecipValue,
            subquery.AnalogTempNormal,
            subquery.AnalogPrecipNormal,
            subquery.AnalogCountyLatitude,
            subquery.AnalogCountyLongitude,
            subquery.rn AS RowNumber
        FROM (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                td.Temperature AS TargetTempValue,
                pd.Precipitation AS TargetPrecipValue,
                tn.NormTemperature AS AnalogTempNormal,
                pn.NormPrecipitation AS AnalogPrecipNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (
                    PARTITION BY d.Year 
                    ORDER BY d.Distance, 
                             pdist.PhysicalDistance
                ) AS rn
            FROM yearly_combined_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN yearly_temperature_data_wi td ON d.TargetCountyID = td.CountyID AND d.Year = td.Year
            JOIN yearly_precipitation_data_wi pd ON d.TargetCountyID = pd.CountyID AND d.Year = pd.Year
            JOIN yearly_temperature_norms tn ON d.AnalogCountyID = tn.CountyID
            JOIN yearly_precipitation_norms pn ON d.AnalogCountyID = pn.CountyID
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyID AND d.AnalogCountyID = pdist.AnalogCountyID
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Year = p_Year
          
        ) AS subquery
        WHERE subquery.rn <= 50 
        ORDER BY subquery.rn;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetTopPrecipAnalogsForCountyByYear` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `GetTopPrecipAnalogsForCountyByYear`(
    IN p_TargetCountyName VARCHAR(100),
    IN p_Year INT
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        SELECT 
            subquery.TargetCountyID,
            subquery.TargetCountyName,
            subquery.Year,
            subquery.AnalogCountyID,
            subquery.AnalogCountyName,
            subquery.AnalogCountyStateAbbr,
            subquery.Distance,
            subquery.TargetPrecipValue,
            subquery.AnalogPrecipNormal,
            subquery.AnalogCountyLatitude,
            subquery.AnalogCountyLongitude,
            subquery.rn AS RowNumber
        FROM (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                pd.Precipitation AS TargetPrecipValue,
                pn.NormPrecipitation AS AnalogPrecipNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (
                    PARTITION BY d.Year 
                    ORDER BY d.Distance, 
                    pdist.PhysicalDistance
                ) AS rn
            FROM yearly_precipitation_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN yearly_precipitation_data_wi pd ON d.TargetCountyID = pd.CountyID AND d.Year = pd.Year
            JOIN yearly_precipitation_norms pn ON d.AnalogCountyID = pn.CountyID
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyID AND d.AnalogCountyID = pdist.AnalogCountyID
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Year = p_Year
        
        ) AS subquery
        WHERE subquery.rn <= 150 
        ORDER BY subquery.rn;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetTopTempAnalogsForCountyByYear` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `GetTopTempAnalogsForCountyByYear`(
    IN p_TargetCountyName VARCHAR(100),
    IN p_Year INT
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        SELECT 
            subquery.TargetCountyID,
            subquery.TargetCountyName,
            subquery.Year,
            subquery.AnalogCountyID,
            subquery.AnalogCountyName,
            subquery.AnalogCountyStateAbbr,
            subquery.Distance,
            subquery.TargetTempValue,
            subquery.AnalogTempNormal,
            subquery.AnalogCountyLatitude,
            subquery.AnalogCountyLongitude,
            subquery.rn AS RowNumber
        FROM (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                td.Temperature AS TargetTempValue,
                tn.NormTemperature AS AnalogTempNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (
                    PARTITION BY d.Year 
                    ORDER BY d.Distance, 
                    pdist.PhysicalDistance
                ) AS rn
            FROM yearly_temperature_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN yearly_temperature_data_wi td ON d.TargetCountyID = td.CountyID AND d.Year = td.Year
            JOIN yearly_temperature_norms tn ON d.AnalogCountyID = tn.CountyID
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyID AND d.AnalogCountyID = pdist.AnalogCountyID
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Year = p_Year
              
        ) AS subquery
        WHERE subquery.rn <= 150 
        ORDER BY subquery.rn;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `InsertCounty` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `InsertCounty`(
    IN p_CountyCode VARCHAR(3),
    IN p_CountyName VARCHAR(100),
    IN p_StateCode VARCHAR(2),
    IN p_Latitude DECIMAL(8, 6),
    IN p_Longitude DECIMAL(9, 6)
)
BEGIN

    
    REPLACE INTO Counties (CountyCode, CountyName, StateCode, Latitude, Longitude)
    VALUES (p_CountyCode, p_CountyName, p_StateCode, p_Latitude, p_Longitude);

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `InsertMonthlyPrecipitationNorms` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `InsertMonthlyPrecipitationNorms`(
    IN p_CountyID INT,
    IN p_Month VARCHAR(2),
    IN p_NormPrecipitation DECIMAL(5, 2),
    IN p_StdDevPrecipitation DECIMAL(5, 2)
)
BEGIN
    
    INSERT INTO monthly_precipitation_norms (CountyID, Month, NormPrecipitation, StdDevPrecipitation)
    VALUES (p_CountyID, p_Month, p_NormPrecipitation, p_StdDevPrecipitation)
    ON DUPLICATE KEY UPDATE
        NormPrecipitation = VALUES(NormPrecipitation),
        StdDevPrecipitation = VALUES(StdDevPrecipitation);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `InsertMonthlyPrecipitationWI` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `InsertMonthlyPrecipitationWI`(
    IN p_CountyID INT,
    IN p_Year INT,
    IN p_Month VARCHAR(2),
    IN p_Precipitation DECIMAL(5, 2)
)
BEGIN
    
    INSERT INTO monthly_precipitation_data_wi (CountyID, Year, Month, Precipitation)
    VALUES (p_CountyID, p_Year, p_Month, p_Precipitation)
    ON DUPLICATE KEY UPDATE
        Precipitation = VALUES(Precipitation);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `InsertMonthlyTemperatureNorms` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `InsertMonthlyTemperatureNorms`(
    IN p_CountyID INT,
    IN p_Month VARCHAR(2),
    IN p_NormTemperature DECIMAL(5, 2),
    IN p_StdDevTemperature DECIMAL(5, 2)
)
BEGIN
    
    INSERT INTO monthly_temperature_norms (CountyID, Month, NormTemperature, StdDevTemperature)
    VALUES (p_CountyID, p_Month, p_NormTemperature, p_StdDevTemperature)
    ON DUPLICATE KEY UPDATE
        NormTemperature = VALUES(NormTemperature),
        StdDevTemperature = VALUES(StdDevTemperature);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `InsertMonthlyTemperatureWI` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `InsertMonthlyTemperatureWI`(
    IN p_CountyID INT,
    IN p_Year INT,
    IN p_Month VARCHAR(2),
    IN p_Temperature DECIMAL(5, 2)
)
BEGIN
    
    INSERT INTO monthly_temperature_data_wi (CountyID, Year, Month, Temperature)
    VALUES (p_CountyID, p_Year, p_Month, p_Temperature)
    ON DUPLICATE KEY UPDATE
        Temperature = VALUES(Temperature);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `InsertSeasonalPrecipitationNorms` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `InsertSeasonalPrecipitationNorms`(
    IN p_CountyID INT,
    IN p_Season VARCHAR(6),
    IN p_NormPrecipitation DECIMAL(5, 2),
    IN p_StdDevPrecipitation DECIMAL(5, 2)
)
BEGIN
    INSERT INTO seasonal_precipitation_norms (CountyID, Season, NormPrecipitation, StdDevPrecipitation)
    VALUES (p_CountyID, p_Season, p_NormPrecipitation, p_StdDevPrecipitation)
    ON DUPLICATE KEY UPDATE
        NormPrecipitation = p_NormPrecipitation,
        StdDevPrecipitation = p_StdDevPrecipitation;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `InsertSeasonalPrecipitationWI` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `InsertSeasonalPrecipitationWI`(
    IN p_CountyID INT,
    IN p_Year INT,
    IN p_Season VARCHAR(6),
    IN p_Precipitation DECIMAL(5, 2)
)
BEGIN
    INSERT INTO seasonal_precipitation_data_wi (CountyID, Year, Season, Precipitation)
    VALUES (p_CountyID, p_Year, p_Season, p_Precipitation)
    ON DUPLICATE KEY UPDATE
        Precipitation = p_Precipitation;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `InsertSeasonalTemperatureNorms` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `InsertSeasonalTemperatureNorms`(
    IN p_CountyID INT,
    IN p_Season VARCHAR(6),
    IN p_NormTemperature DECIMAL(5, 2),
    IN p_StdDevTemperature DECIMAL(5, 2)
)
BEGIN
    INSERT INTO seasonal_temperature_norms (CountyID, Season, NormTemperature, StdDevTemperature)
    VALUES (p_CountyID, p_Season, p_NormTemperature, p_StdDevTemperature)
    ON DUPLICATE KEY UPDATE
        NormTemperature = p_NormTemperature,
        StdDevTemperature = p_StdDevTemperature;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `InsertSeasonalTemperatureWI` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `InsertSeasonalTemperatureWI`(
    IN p_CountyID INT,
    IN p_Year INT,
    IN p_Season VARCHAR(6),
    IN p_Temperature DECIMAL(5, 2)
)
BEGIN
    INSERT INTO seasonal_temperature_data_wi (CountyID, Year, Season, Temperature)
    VALUES (p_CountyID, p_Year, p_Season, p_Temperature)
    ON DUPLICATE KEY UPDATE
        Temperature = p_Temperature;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `InsertState` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `InsertState`(
    IN stateCode VARCHAR(2),
    IN stateAbbr VARCHAR(2),
    IN stateName VARCHAR(100)
)
BEGIN
    
    REPLACE INTO States (StateCode, StateAbbr, StateName)
    VALUES (stateCode, stateAbbr, stateName);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `InsertYearlyPrecipitationNorms` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `InsertYearlyPrecipitationNorms`(
    IN p_CountyID INT,
    IN p_NormPrecipitation DECIMAL(5, 2),
    IN p_StdDevPrecipitation DECIMAL(5, 2)
)
BEGIN
    INSERT INTO yearly_precipitation_norms (CountyID, NormPrecipitation, StdDevPrecipitation)
    VALUES (p_CountyID, p_NormPrecipitation, p_StdDevPrecipitation)
    ON DUPLICATE KEY UPDATE
        NormPrecipitation = p_NormPrecipitation,
        StdDevPrecipitation = p_StdDevPrecipitation;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `InsertYearlyPrecipitationWI` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `InsertYearlyPrecipitationWI`(
    IN p_CountyID INT,
    IN p_Year INT,
    IN p_Precipitation DECIMAL(5, 2)
)
BEGIN
    INSERT INTO yearly_precipitation_data_wi (CountyID, Year, Precipitation)
    VALUES (p_CountyID, p_Year, p_Precipitation)
    ON DUPLICATE KEY UPDATE
        Precipitation = p_Precipitation;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `InsertYearlyTemperatureNorms` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `InsertYearlyTemperatureNorms`(
    IN p_CountyID INT,
    IN p_NormTemperature DECIMAL(5, 2),
    IN p_StdDevTemperature DECIMAL(5, 2)
)
BEGIN
    INSERT INTO yearly_temperature_norms (CountyID, NormTemperature, StdDevTemperature)
    VALUES (p_CountyID, p_NormTemperature, p_StdDevTemperature)
    ON DUPLICATE KEY UPDATE
        NormTemperature = p_NormTemperature,
        StdDevTemperature = p_StdDevTemperature;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `InsertYearlyTemperatureWI` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`driftless`@`%` PROCEDURE `InsertYearlyTemperatureWI`(
    IN p_CountyID INT,
    IN p_Year INT,
    IN p_Temperature DECIMAL(5, 2)
)
BEGIN
    INSERT INTO yearly_temperature_data_wi (CountyID, Year, Temperature)
    VALUES (p_CountyID, p_Year, p_Temperature)
    ON DUPLICATE KEY UPDATE
        Temperature = p_Temperature;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-15 12:36:53
