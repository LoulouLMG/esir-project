-- MySQL Script generated by MySQL Workbench
-- 10/16/14 20:09:55
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema esir-project
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema esir-project
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `esir-project` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
USE `esir-project` ;

-- -----------------------------------------------------
-- Table `esir-project`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `esir-project`.`user` (
  `id` INT NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `connected` TINYINT(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `esir-project`.`score`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `esir-project`.`score` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `score` TINYINT(4) NULL,
  `user_id` INT NOT NULL,
  PRIMARY KEY (`id`, `user_id`),
  INDEX `fk_score_user_idx` (`user_id` ASC),
  CONSTRAINT `fk_score_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `esir-project`.`user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
