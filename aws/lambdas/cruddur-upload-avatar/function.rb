require 'aws-sdk-s3'
require 'json'
require 'jwt'

def handler(event:, context:)
  puts "Full event received: #{event.to_json}"

  # Define allowed origins for all environments
  allowed_origins = [
    "http://localhost:3000",
    "https://localhost:3000",
    "https://3000-omenking-awsbootcampcru-2n1d6e0bd1f.ws-us94.gitpod.io",
    "http://cruddur-alb-1273100010.ap-south-1.elb.amazonaws.com:3000",
    "http://cruddur-alb-1273100010.ap-south-1.elb.amazonaws.com:4567"
  ] 

  # Get the request origin
  origin = event['headers']['origin'] || event['headers']['Origin']
  cors_origin = allowed_origins.include?(origin) ? origin : allowed_origins.first

  # Common CORS headers
  cors_headers = {
    "Access-Control-Allow-Headers" => "*, Authorization",
    "Access-Control-Allow-Origin" => cors_origin,
    "Access-Control-Allow-Methods" => "OPTIONS,GET,POST"
  }

  # return cors headers for preflight check
  begin
    if event['routeKey'] == "OPTIONS /{proxy+}"
      puts({step: 'preflight', message: 'preflight CORS check'}.to_json)
      return { 
        headers: cors_headers,
        statusCode: 200
      }
    end

    puts("Handling POST request")
    puts("Request body: #{event['body']}")
    puts("Headers: #{event['headers']}")

    # Parse JSON body
    body = if event['body'].is_a?(String)
            JSON.parse(event['body'])
          else
            event['body'] || {}
          end

    puts "Parsed body: #{body}"

    auth_header = event['headers']['authorization'] || event['headers']['Authorization']
    unless auth_header && auth_header.start_with?('Bearer ')
      return {
        headers: cors_headers,
        statusCode: 401,
        body: {error: "Unauthorized"}.to_json
      }
    end

    token = auth_header.split(' ')[1]
    puts({step: 'presignedurl', access_token: token}.to_json)

    # Parse and validate request body
    body = JSON.parse(event["body"] || "{}")
    extension = body["extension"]
    unless extension && extension.match(/^[a-zA-Z0-9]+$/)
      return {
        headers: cors_headers,
        statusCode: 400,
        body: {error: "Invalid extension"}.to_json
      }
    end

    # Decode token and get user UUID
    decoded_token = JWT.decode(token, nil, false)
    cognito_user_uuid = decoded_token[0]['sub']

    # Generate presigned URL
    s3 = Aws::S3::Resource.new
    bucket_name = ENV["UPLOADS_BUCKET_NAME"]
    object_key = "#{cognito_user_uuid}.#{extension}"

    puts({object_key: object_key}.to_json)

    obj = s3.bucket(bucket_name).object(object_key)
    url = obj.presigned_url(:put, expires_in: 300) # 5 minutes
    puts "Generated URL: #{url}"
    {
      headers: cors_headers,
      statusCode: 200,
      body: {url: url}.to_json
    }
  rescue => e
    puts "Full error: #{e.inspect}"
    puts "Backtrace: #{e.backtrace.join("\n")}"
    puts "ERROR: #{e.message}\n#{e.backtrace.join("\n")}"
    {
      headers: cors_headers,
      statusCode: 500,
      body: {error: "Internal server error: #{e.message}"}.to_json
    }
  end
end