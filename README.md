# Dapeng-Logistics
Dapeng Logistics is a full-service warehousing solution for our clients needs.  We provide logistic services and storage so that you can focus on the needs of your business.

# Cloud Service Setup Guide

This guide provides detailed instructions on setting up various cloud services, including AliYun ECS, AWS RDS MySQL, and AWS S3.

## Prerequisites

1. **Cloud Accounts**: Ensure you have accounts for Alibaba Cloud and AWS.
2. **Access Keys**: Obtain your access keys and secrets for both Alibaba Cloud and AWS.
3. **AWS CLI (Optional)**: Install the AWS CLI for command-line access to AWS resources. Download it [here](https://aws.amazon.com/cli/).

---

## Setting Up AliYun ECS

### 1. Log in to Alibaba Cloud Console

1. Navigate to the [Alibaba Cloud Console](https://home.console.aliyun.com).
2. Log in with your Alibaba Cloud account credentials.

### 2. Create an ECS Instance

1. Navigate to **Elastic Compute Service**.
2. Click on **Instances** and then click **Create Instance**.

### 3. Configure Instance

1. **Region and Zone**: Choose the region and zone closest to your target users.
2. **Instance Type**: Select an instance type that meets your needs.
3. **Image**: Choose an OS image (e.g., Ubuntu 20.04 LTS).
4. **Storage**: Configure storage options.
5. **Network and Security**:
   - **VPC**: Select or create a VPC.
   - **Security Group**: Select or create a security group.
6. **System Configurations**:
   - **Login Credentials**: Choose between a password or an SSH key pair for authentication.
   - **Instance Name**: Optionally, provide a name for your instance.

### 4. Review and Launch

1. Review your configuration settings.
2. Click **Create Instance** to launch your ECS instance.

### 5. Access Your ECS Instance

- **Using SSH**:
  ```bash
  ssh -i /path/to/your/private-key.pem root@<ECS_Instance_IP>
  ```
  Replace `/path/to/your/private-key.pem` with the path to your SSH private key and `<ECS_Instance_IP>` with the public IP address of your ECS instance.

---

## Setting Up AWS RDS MySQL
In config/connection, const sequelize = process.env.DATABASE_URL,
In heroku config var:
{DATABASE_URL: “mysql://Username:Password@AWS_RDS_Endpoint/DB_Name?sslmode=verify-full&sslrootcert=config/rds-combined-ca-bundle.pem”}

### 1. Log in to AWS Management Console

1. Navigate to the [AWS Management Console](https://aws.amazon.com/console/).
2. Log in with your AWS account credentials.

### 2. Create an RDS Instance

1. Navigate to **RDS** under the **Database** section.
2. Click on **Create database**.

### 3. Configure Database

1. **Engine Options**: Choose **MySQL**.
2. **Templates**: Choose a template (e.g., Production, Dev/Test, Free tier).
3. **Settings**: Enter a DB instance identifier, master username, and master password.
4. **DB Instance Size**: Choose an instance class (e.g., db.t3.micro).
5. **Storage**: Specify the storage type and size.
6. **Availability & Durability**: Choose Multi-AZ deployment for high availability.

### 4. Configure Advanced Settings

1. **Network & Security**: Select a VPC and configure security groups.
2. **Database Options**: Optionally specify a DB name.
3. **Backup**: Configure backup settings.
4. **Monitoring**: Enable enhanced monitoring if needed.
5. **Maintenance**: Configure maintenance settings.

### 5. Review and Create

1. Review your configuration settings.
2. Click **Create database** to launch your RDS MySQL instance.

### 6. Connect to Your RDS MySQL Instance

- **Retrieve Endpoint**: Find the **Endpoint** and **Port** in the RDS console.
- **Connect Using MySQL Client**:
  ```bash
  mysql -h <RDS_Endpoint> -P <Port> -u <Master_Username> -p
  ```

---

## Setting Up AWS S3
please refer to https://youtu.be/NZElg91l_ms
### 1. Log in to AWS Management Console

1. Navigate to the [AWS Management Console](https://aws.amazon.com/console/).
2. Log in with your AWS account credentials.

### 2. Create an S3 Bucket

1. Navigate to **S3** under the **Storage** section.
2. Click on **Create bucket**.

### 3. Configure Bucket

1. **Bucket Name**: Enter a globally unique name.
2. **Region**: Select the AWS region.
3. **Object Ownership**: Choose the appropriate settings.
4. **Block Public Access Settings**: Configure public access settings.
5. **Bucket Versioning**: Optionally, enable versioning.
6. **Tags**: Optionally, add tags.
7. **Default Encryption**: Optionally, enable encryption.

### 4. Review and Create

1. Review your configuration settings.
2. Click **Create bucket**.

### 5. Upload Objects to Your S3 Bucket

1. Navigate to your bucket.
2. Click **Upload** and add files or folders.
3. Optionally, configure storage class and encryption settings.
4. Click **Upload**.

### 6. Access Your Objects

1. Navigate to your bucket.
2. Click on the object and use the **Object URL**.

### 7. Configure Bucket Policies and Permissions

1. Navigate to your bucket.
2. Click on the **Permissions** tab.
3. Add a bucket policy or configure CORS and ACLs.

### 8. Enable S3 Lifecycle Policies

1. Navigate to your bucket.
2. Click on the **Management** tab.
3. Create a lifecycle rule.

### 9. Enable Logging and Monitoring

1. Navigate to your bucket.
2. Click on the **Properties** tab.
3. Enable server access logging and CloudWatch metrics.

### Using AWS CLI with S3

1. **Configure AWS CLI**:
   ```bash
   aws configure
   ```
2. **Create a Bucket**:
   ```bash
   aws s3 mb s3://my-unique-bucket-name
   ```
3. **Upload a File**:
   ```bash
   aws s3 cp path/to/local/file.txt s3://my-unique-bucket-name/
   ```
4. **Download a File**:
   ```bash
   aws s3 cp s3://my-unique-bucket-name/file.txt path/to/local/
   ```
5. **List Buckets**:
   ```bash
   aws s3 ls
   ```
6. **List Objects in a Bucket**:
   ```bash
   aws s3 ls s3://my-unique-bucket-name/
   ```

---

## Troubleshooting

### AliYun ECS

- **Connection Issues**: Ensure security group rules allow inbound traffic on the required ports (e.g., SSH port 22).
- **Instance Performance**: Monitor performance metrics and adjust resources as needed.

### AWS RDS MySQL

- **Connection Issues**: Ensure security group rules allow inbound traffic on the required port (default MySQL port is 3306).
- **Instance Performance**: Monitor performance metrics and adjust resources as needed.

### AWS S3

- **Access Denied Errors**: Ensure your IAM user or role has the necessary permissions.
- **Object Not Found**: Verify the object key and bucket name are correct.

## Additional Resources

- **Alibaba Cloud ECS Documentation**: [ECS Documentation](https://www.alibabacloud.com/help/product/25365.htm)
- **AWS RDS Documentation**: [RDS Documentation](https://docs.aws.amazon.com/rds/)
- **MySQL Documentation**: [MySQL Documentation](https://dev.mysql.com/doc/)
- **AWS S3 Documentation**: [S3 Documentation](https://docs.aws.amazon.com/s3/)
- **AWS CLI S3 Commands**: [CLI S3 Commands](https://docs.aws.amazon.com/cli/latest/reference/s3/)
- **Alibaba Cloud Support**: [Support](https://www.alibabacloud.com/support)
- **AWS Support**: [Support](https://aws.amazon.com/support/)


# Contributer
Rex Yu: lead UI designer, software developer, integration specialist
Jilbear Hatch: project owner


