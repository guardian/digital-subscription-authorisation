
name := "digital-subscription-authorisation-scala-lambdas"

organization := "com.gu"

description:= "scala lambdas for digital subscription authorisation"

version := "1.0"

scalaVersion := "2.12.2"

scalacOptions ++= Seq(
  "-deprecation",
  "-encoding", "UTF-8",
  "-target:jvm-1.8",
  "-Ywarn-dead-code"
)

assemblyJarName := "digital-subscription-authorisation-scala-lambdas.jar"
//libraryDependencies ++= Seq(
//  "com.amazonaws" % "aws-lambda-java-core" % "1.2.0",
//  "org.slf4j" % "slf4j-simple" % "1.8.0-beta2"
//)


